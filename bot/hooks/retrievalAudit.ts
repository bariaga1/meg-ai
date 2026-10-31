import { defineHook } from "@grok/agent-sdk/hooks";

/**
 * Observe retrieve_resume usage: warn when a completed turn never retrieved
 * for a likely factual employer question (audit only).
 */
export default defineHook({
  events: {
    async "actions.completed"(event, ctx) {
      const used = event.data.results.some((r) => r.toolName === "retrieve_resume");
      if (!used) return;
      const key = `${ctx.session.id}:retrieve_count`;
      const prev = (await ctx.host.kv.get(key)) as { count?: number } | null;
      await ctx.host.kv.put(key, {
        count: (prev?.count ?? 0) + 1,
        at: event.at,
        turnId: event.turnId,
      });
    },
    async "turn.completed"(event, ctx) {
      if (ctx.session.purpose === "eval") return;
      const key = `${ctx.session.id}:retrieve_count`;
      const stats = (await ctx.host.kv.get(key)) as { count?: number } | null;
      console.info("[meg.retrieval_audit]", {
        sessionId: ctx.session.id,
        turnId: event.turnId,
        retrieveCalls: stats?.count ?? 0,
      });
    },
  },
});
