import { streamText } from "ai";
import { localMegReply } from "./localMeg";
import {
  DEFAULT_GATEWAY_MODEL,
  MEG_MAX_HISTORY_MESSAGES,
  MEG_MAX_OUTPUT_TOKENS,
  MEG_SYSTEM_PROMPT,
} from "./megPrompt";
import { formatResumeContext, retrieveResumeContext } from "./megRetrieve";

export type ChatTurn = { role: "user" | "assistant"; text: string };

export function isGatewayConfigured(): boolean {
  if (process.env.MEG_DISABLE_GATEWAY === "1") return false;
  if (process.env.MEG_FORCE_LOCAL === "1") return false;
  if (process.env.AI_GATEWAY_API_KEY?.trim()) return true;
  // Linked Vercel deploys get OIDC; AI SDK uses it automatically.
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return true;
  return process.env.MEG_USE_GATEWAY === "1";
}

export function gatewayModelId(): string {
  return process.env.AI_GATEWAY_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
}

export function normalizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const text = (item as { text?: unknown }).text;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") {
      continue;
    }
    const cleaned = text.trim().slice(0, 2000);
    if (!cleaned) continue;
    out.push({ role, text: cleaned });
    if (out.length >= MEG_MAX_HISTORY_MESSAGES) break;
  }
  return out;
}

/** NDJSON stream shaped like the Agent SDK events MegChat already parses. */
export function megGatewayNdjsonStream(
  message: string,
  history: ChatTurn[] = [],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const sessionId = `gw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const continuationToken = `gw:${sessionId}`;
  const historyForRetrieve = history.filter((t) => t.text !== message);
  const hits = retrieveResumeContext(message, 4, historyForRetrieve);
  const context = formatResumeContext(hits);
  const model = gatewayModelId();

  const prior = historyForRetrieve.map((t) => ({
    role: t.role as "user" | "assistant",
    content: t.text,
  }));

  const result = streamText({
    model,
    system: MEG_SYSTEM_PROMPT,
    messages: [
      ...prior,
      {
        role: "user",
        content: `Resume context (exclusive source — do not add projects, employers, or tools that are not written below):\n${context}\n\nRecruiter question:\n${message}`,
      },
    ],
    maxOutputTokens: MEG_MAX_OUTPUT_TOKENS,
    // Low enough to stay on-resume; high enough for natural phrasing.
    temperature: 0.35,
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let index = 0;
      const push = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      };

      push({
        type: "session",
        sessionId,
        continuationToken,
        mode: "gateway",
      });

      try {
        let saw = false;
        for await (const delta of result.textStream) {
          if (!delta) continue;
          saw = true;
          push({
            type: "message.appended",
            index: index++,
            data: { delta },
          });
        }
        const text = await result.text;
        if (!saw && !text.trim()) {
          throw new Error("empty_gateway_reply");
        }
        push({
          type: "message.completed",
          index: index++,
          data: { text },
        });
        push({ type: "turn.completed", index: index++, data: {} });
      } catch (err) {
        // Keep the site useful if Gateway credits / OIDC are not ready yet.
        const fallback = localMegReply(message);
        const parts = fallback.match(/\S+\s*|\s+/g)?.filter(Boolean) ?? [fallback];
        for (const part of parts) {
          push({
            type: "message.appended",
            index: index++,
            data: { delta: part },
          });
        }
        push({
          type: "message.completed",
          index: index++,
          data: { text: fallback },
        });
        push({
          type: "turn.completed",
          index: index++,
          data: {
            fallback: "local",
            reason: err instanceof Error ? err.message.slice(0, 200) : "gateway_error",
          },
        });
      } finally {
        controller.close();
      }
    },
  });
}
