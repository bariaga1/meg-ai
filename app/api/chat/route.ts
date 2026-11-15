import { enforceChatGuards, enforceSessionBudget } from "@/lib/chatGuard";
import { checkUserMessage } from "@/lib/guardrails";
import { localMegNdjsonStream } from "@/lib/localMeg";
import {
  isGatewayConfigured,
  megGatewayNdjsonStream,
  normalizeHistory,
} from "@/lib/megGatewayChat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  message?: unknown;
  history?: unknown;
  userTurnCount?: unknown;
  /** Highlight story id sent by a box's Ask Meg button, e.g. "renewals". */
  topic?: unknown;
};

function ndjsonResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/**
 * One chat turn. Replies stream as NDJSON events (session, message.appended,
 * message.completed, turn.completed). AI Gateway writes the answer from the
 * retrieved resume sections; without Gateway, a lexical excerpt reply is used.
 */
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
  // Only a short slug; anything else is ignored and the question is searched as usual.
  const topic =
    typeof body.topic === "string" && /^[a-z0-9-]{1,40}$/.test(body.topic) ? body.topic : undefined;

  // MEG_FORCE_LOCAL=1, MEG_DISABLE_GATEWAY=1, or no Gateway credentials.
  if (!isGatewayConfigured()) {
    return ndjsonResponse(localMegNdjsonStream(checked.text, topic));
  }
  try {
    return ndjsonResponse(megGatewayNdjsonStream(checked.text, history, topic));
  } catch {
    // Setup errors (e.g. a bad model id) still get a resume-grounded reply.
    return ndjsonResponse(localMegNdjsonStream(checked.text, topic));
  }
}
