import {
  isAgentConfigured,
  openSessionStream,
  startOrContinueSession,
} from "@/lib/agentClient";
import { enforceChatGuards, enforceSessionBudget } from "@/lib/chatGuard";
import {
  isGatewayConfigured,
  megGatewayNdjsonStream,
  normalizeHistory,
} from "@/lib/megGatewayChat";
import { checkUserMessage } from "@/lib/guardrails";
import { localMegNdjsonStream, shouldUseLocalFallback } from "@/lib/localMeg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  message?: unknown;
  history?: unknown;
  userTurnCount?: unknown;
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
  const guard = await enforceChatGuards(req);
  if (!guard.ok) {
    return Response.json(
      { ok: false, error: guard.error, message: guard.message },
      { status: guard.status },
    );
  }

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

  const rawHistoryLen = Array.isArray(body.history) ? body.history.length : 0;
  const userTurnCount =
    typeof body.userTurnCount === "number" && Number.isFinite(body.userTurnCount)
      ? Math.max(0, Math.floor(body.userTurnCount))
      : undefined;
  const sessionBudget = enforceSessionBudget(rawHistoryLen, userTurnCount);
  if (!sessionBudget.ok) {
    return Response.json(
      { ok: false, error: sessionBudget.error, message: sessionBudget.message },
      { status: sessionBudget.status },
    );
  }
  const history = normalizeHistory(body.history);

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

  const fromLocalOrGw =
    sessionId?.startsWith("local_") ||
    sessionId?.startsWith("gw_") ||
    continuationToken?.startsWith("local:") ||
    continuationToken?.startsWith("gw:");
  const agentSessionId = fromLocalOrGw ? undefined : sessionId;
  const agentToken = fromLocalOrGw ? undefined : continuationToken;
  const agentStart = fromLocalOrGw ? 0 : startIndex;

  if (shouldUseLocalFallback()) {
    return ndjsonResponse(localMegNdjsonStream(checked.text));
  }

  // Prefer AI Gateway when no Cursor agent URL is configured.
  if (!isAgentConfigured() && isGatewayConfigured()) {
    try {
      return ndjsonResponse(megGatewayNdjsonStream(checked.text, history));
    } catch {
      return ndjsonResponse(localMegNdjsonStream(checked.text));
    }
  }

  if (!isAgentConfigured()) {
    return ndjsonResponse(localMegNdjsonStream(checked.text));
  }

  try {
    const session = await startOrContinueSession({
      message: checked.text,
      sessionId: agentSessionId,
      continuationToken: agentToken,
    });

    const streamRes = await openSessionStream(session.sessionId, agentStart);
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
    let pending = "";
    let turnSettled = false;

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
        if (turnSettled) {
          controller.close();
          return;
        }
        const { done, value } = await upstream.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        controller.enqueue(encoder.encode(chunk));
        pending += chunk;
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.includes('"type"')) continue;
          try {
            const ev = JSON.parse(line) as { type?: string };
            if (ev.type === "turn.completed" || ev.type === "turn.failed") {
              turnSettled = true;
            }
          } catch {
            // Keep forwarding. A split JSON line stays in `pending`.
          }
        }
        if (turnSettled) {
          await upstream.cancel();
          controller.close();
        }
      },
      cancel() {
        void upstream.cancel();
      },
    });

    return ndjsonResponse(stream);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent proxy failed";
    const missing = message.includes("AGENT_BASE_URL");
    return Response.json(
      { ok: false, error: missing ? "agent_unconfigured" : "agent_error", message },
      { status: missing ? 503 : 502 },
    );
  }
}
