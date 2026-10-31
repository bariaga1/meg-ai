import { unstable_checkRateLimit as checkRateLimit } from "@vercel/firewall";
import { checkBotId } from "botid/server";

/** Must match the Vercel Firewall rate-limit rule id. */
export const CHAT_RATE_LIMIT_ID = "meg-chat";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const MAX_PER_DAY = 80;

type Bucket = { count: number; resetAt: number };
const minuteBuckets = new Map<string, Bucket>();
const dayBuckets = new Map<string, Bucket>();

function bump(map: Map<string, Bucket>, key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const cur = map.get(key);
  if (!cur || now >= cur.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  cur.count += 1;
  return cur.count > max;
}

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export type ChatGuardResult =
  | { ok: true }
  | { ok: false; status: number; error: string; message: string };

/** BotID + Firewall rate limit + process-local caps (local / soft backup). */
export async function enforceChatGuards(req: Request): Promise<ChatGuardResult> {
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      return {
        ok: false,
        status: 403,
        error: "bot_denied",
        message: "Automated traffic is blocked on this chat.",
      };
    }
  } catch {
    // Hobby plans may not enable BotID; rate limits below still apply.
  }

  try {
    const { rateLimited, error } = await checkRateLimit(CHAT_RATE_LIMIT_ID, {
      request: req,
      timeout: 800,
    });
    if (rateLimited) {
      return {
        ok: false,
        status: 429,
        error: "rate_limited",
        message: "Too many messages. Wait a minute and try again.",
      };
    }
    // not-found is fine locally / before the WAF rule exists.
    if (error === "blocked") {
      return {
        ok: false,
        status: 403,
        error: "firewall_blocked",
        message: "Request blocked.",
      };
    }
  } catch {
    // Firewall SDK unavailable (local). Fall through to in-process limits.
  }

  const key = clientKey(req);
  if (bump(minuteBuckets, `m:${key}`, WINDOW_MS, MAX_PER_WINDOW)) {
    return {
      ok: false,
      status: 429,
      error: "rate_limited",
      message: "Too many messages. Wait a minute and try again.",
    };
  }
  if (bump(dayBuckets, `d:${key}`, 86_400_000, MAX_PER_DAY)) {
    return {
      ok: false,
      status: 429,
      error: "rate_limited",
      message: "Daily chat limit reached. Try again tomorrow.",
    };
  }

  return { ok: true };
}
