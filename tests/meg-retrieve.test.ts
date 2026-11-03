import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatResumeContext,
  retrieveResumeContext,
  retrievalQuery,
} from "../lib/megRetrieve";
import { MEG_SYSTEM_PROMPT } from "../lib/megPrompt";
import { GROUNDING_CASES } from "./fixtures/common-questions";

describe("meg retrieval grounding (no model calls)", () => {
  for (const c of GROUNDING_CASES) {
    it(c.id, () => {
      const hits = retrieveResumeContext(c.question, 4, c.history ?? []);
      const ids = hits.map((h) => h.id).join(" ");
      const context = formatResumeContext(hits);

      for (const needle of c.mustRetrieveIds) {
        assert.match(
          ids,
          new RegExp(needle, "i"),
          `expected a chunk id containing "${needle}"; got: ${ids || "(none)"}`,
        );
      }

      for (const needle of c.mustAppearInContext) {
        assert.ok(
          context.includes(needle),
          `expected context to include "${needle}"\n--- context ---\n${context.slice(0, 800)}`,
        );
      }

      if (c.mustNotBeOnlyJob) {
        const jobHits = hits.filter(
          (h) => h.tags.includes("job") || /^job-/i.test(h.id),
        );
        assert.ok(
          jobHits.length >= 2,
          `expected multiple job chunks for "${c.id}", got ${jobHits.length}: ${ids}`,
        );
      }
    });
  }
});

describe("retrievalQuery follow-ups", () => {
  it("does not re-anchor other-roles on the prior Medallia question", () => {
    const history = [
      { role: "user" as const, text: "What did you do at Medallia?" },
    ];
    const q = retrievalQuery("What other roles did you have?", history);
    assert.match(q, /Marathon/i);
    assert.match(q, /Nasdaq/i);
    assert.doesNotMatch(q, /^What did you do at Medallia\?/i);
  });

  it("keeps project follow-ups tied to the prior project ask", () => {
    const history = [
      {
        role: "user" as const,
        text: "What independent projects have you built?",
      },
    ];
    const q = retrievalQuery("What else?", history);
    assert.match(q, /independent projects/i);
  });
});

describe("gateway system prompt contract", () => {
  it("requires exclusive resume grounding and organic role answers", () => {
    assert.match(MEG_SYSTEM_PROMPT, /exclusive source|Resume context/i);
    assert.match(MEG_SYSTEM_PROMPT, /Do not invent filler portfolio/i);
    assert.match(MEG_SYSTEM_PROMPT, /title and the dates/i);
    assert.match(MEG_SYSTEM_PROMPT, /Never say Medallia was the only role/i);
  });
});
