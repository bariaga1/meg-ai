import { openSessionStream, startOrContinueSession } from "@/lib/agentClient";
import { checkUserMessage } from "@/lib/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  message?: unknown;
  sessionId?: unknown;
  continuationToken?: unknown;
  startIndex?: unknown;
};

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

  try {
    const session = await startOrContinueSession({
      message: checked.text,
      sessionId,
      continuationToken,
    });

    const streamRes = await openSessionStream(session.sessionId, startIndex);
    if (!streamRes.ok || !streamRes.body) {
      const detail = await streamRes.text().catch(() => "");
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
        // Forward NDJSON; also emit a compact assistant delta helper when we see message.appended
        const chunk = decoder.decode(value, { stream: true });
        controller.enqueue(encoder.encode(chunk));
      },
      cancel() {
        void upstream.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent proxy failed";
    const missing = message.includes("AGENT_BASE_URL");
    return Response.json(
      { ok: false, error: missing ? "agent_unconfigured" : "agent_error", message },
      { status: missing ? 503 : 502 },
    );
  }
}
