import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Meg retrieves before answering a project question.",
  async test(t) {
    await t.send("Tell me about the Can I Park Here? project.");
    t.succeeded();
    t.calledTool("retrieve_resume");
  },
});
