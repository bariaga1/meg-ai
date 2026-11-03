import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "Meg",
  description:
    "Employer-facing resume chat agent for Omega Bariagaber. Answers only from retrieved resume context.",
  // Composer, not Grok. No built-in coding tools: the resume tool is enough.
  model: "composer-2.5",
  tools: [],
});
