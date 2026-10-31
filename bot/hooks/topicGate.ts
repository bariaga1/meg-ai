import { defineHook } from "@grok/agent-sdk/hooks";

const OFF_TOPIC_HINT =
  /\b(write\s+(me\s+)?(a\s+)?(poem|essay|homework)|solve\s+this\s+leetcode|stock\s+tips|crypto\s+signal)\b/i;

/**
 * Observe-only: log likely off-topic prompts for later review.
 * Refusal remains in instructions.md (hooks cannot change the turn).
 */
export default defineHook({
  events: {
    async "message.received"(event, ctx) {
      const text = event.data.text ?? "";
      if (!OFF_TOPIC_HINT.test(text)) return;
      const key = `${ctx.session.id}:offtopic`;
      const prev = (await ctx.host.kv.get(key)) as { count?: number } | null;
      const count = (prev?.count ?? 0) + 1;
      await ctx.host.kv.put(key, { count, last: text.slice(0, 240), at: event.at });
      console.info("[meg.topic_gate]", {
        sessionId: ctx.session.id,
        count,
        preview: text.slice(0, 120),
      });
    },
  },
});
