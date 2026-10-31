import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "Meg",
  description:
    "Employer-facing resume chat agent for Omega Bariagaber. Answers only from retrieved resume context.",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
