import {
  isAgentConfigured,
  openSessionStream,
  startOrContinueSession,
} from "@/lib/agentClient";
import { checkUserMessage } from "@/lib/guardrails";
import { localMegNdjsonStream, shouldUseLocalFallback } from "@/lib/localMeg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  message?: unknown;
  sessionId?: unknown;
  continuationToken?: unknown;
  startIndex?: unknown;
};

function ndjsonResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const checked = checkUserMessage(body.message);
  if (!checked.ok) {
    return Response.json(
      { ok: false, error: checked.code, message: checked.reason },
      { status: 400 },
    );
  }

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId ? body.sessionId : undefined;
  const continuationToken =
    typeof body.continuationToken === "string" && body.continuationToken
      ? body.continuationToken
      : undefined;
  const startIndex =
    typeof body.startIndex === "number" && Number.isFinite(body.startIndex)
      ? Math.max(0, Math.floor(body.startIndex))
      : 0;

  if (sessionId && !continuationToken) {
    return Response.json(
      { ok: false, error: "missing_continuation", message: "continuationToken is required." },
      { status: 400 },
    );
  }

  // Lexical local Meg when the Cursor agent isn't wired (great for local demo / pre-deploy).
  if (shouldUseLocalFallback() || !isAgentConfigured()) {
    return ndjsonResponse(localMegNdjsonStream(checked.text));
  }

  try {
    const session = await startOrContinueSession({
      message: checked.text,
      sessionId,
      continuationToken,
    });

    const streamRes = await openSessionStream(session.sessionId, startIndex);
    if (!streamRes.ok || !streamRes.body) {
      const detail = await streamRes.text().catch(() => "");
      if (process.env.MEG_DISABLE_LOCAL_FALLBACK !== "1") {
        return ndjsonResponse(localMegNdjsonStream(checked.text));
      }
      return Response.json(
        {
          ok: false,
          error: "stream_failed",
          message: detail || `Agent stream failed (${streamRes.status})`,
        },
        { status: 502 },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const upstream = streamRes.body.getReader();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              type: "session",
              sessionId: session.sessionId,
              continuationToken: session.continuationToken,
            })}\n`,
          ),
        );
      },
      async pull(controller) {
        const { done, value } = await upstream.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        controller.enqueue(encoder.encode(chunk));
      },
      cancel() {
        void upstream.cancel();
      },
    });

    return ndjsonResponse(stream);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent proxy failed";
    if (process.env.MEG_DISABLE_LOCAL_FALLBACK !== "1") {
      return ndjsonResponse(localMegNdjsonStream(checked.text));
    }
    const missing = message.includes("AGENT_BASE_URL");
    return Response.json(
      { ok: false, error: missing ? "agent_unconfigured" : "agent_error", message },
      { status: missing ? 503 : 502 },
    );
  }
}
