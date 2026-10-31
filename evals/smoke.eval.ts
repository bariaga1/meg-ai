import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Meg retrieves resume context before answering a skills question.",
  async test(t) {
    await t.send(
      "What programming languages and BI tools does Omega list on the resume?",
    );
    t.succeeded();
    t.calledTool("retrieve_resume");
  },
});
