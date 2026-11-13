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

describe("strengths", () => {
  it("maps strength wording to core competencies", () => {
    for (const question of [
      "What are his strengths?",
      "What are Omega's strengths?",
      "What are his strengths should be listed",
      "What competencies does he have?",
    ]) {
      const ids = retrieveResumeContext(question)
        .map((hit) => hit.id)
        .join(" ");
      assert.match(ids, /core-competencies/);
    }
  });
});

describe("shortcomings", () => {
  it("uses the resume summary and leaves project limits out", () => {
    for (const question of ["any shortcomings?", "any short comings?"]) {
      const ids = retrieveResumeContext(question)
        .map((hit) => hit.id)
        .join(" ");
      assert.match(ids, /summary|career-highlights/);
      assert.match(ids, /medallia/i);
      assert.doesNotMatch(ids, /careeros|storefront|park/i);
    }
  });

  it("keeps a lone question mark on the prior shortcomings question", () => {
    const ids = retrieveResumeContext("?", 4, [
      { role: "user", text: "any shortcomings?" },
    ])
      .map((hit) => hit.id)
      .join(" ");
    assert.match(ids, /medallia/i);
    assert.doesNotMatch(ids, /careeros|storefront|park/i);
  });
});

describe("project follow-up", () => {
  it("answers what about the projects with the three projects, not the summary", () => {
    const hits = retrieveResumeContext("what about the projects", 4, [
      { role: "user", text: "Tell me about your experience with AI" },
      {
        role: "assistant",
        text: "Omega deepened Python skills through hands-on projects.",
      },
    ]);
    const ids = hits.map((hit) => hit.id);
    assert.ok(ids.some((id) => /park/i.test(id)));
    assert.ok(ids.some((id) => /careeros/i.test(id)));
    assert.ok(ids.some((id) => /storefront/i.test(id)));
    assert.equal(ids.includes("summary"), false);
    assert.ok(ids.findIndex((id) => /park|careeros|storefront/i.test(id)) === 0);
  });
});

describe("jobs before side projects", () => {
  it("leads an AI-technology question with Medallia, then the full personal projects", () => {
    const hits = retrieveResumeContext("What AI technology has Omega used?");
    const ids = hits.map((hit) => hit.id);
    const medallia = ids.findIndex((id) => /medallia/i.test(id));
    const park = ids.findIndex((id) => /park/i.test(id));
    const careeros = ids.findIndex((id) => /careeros/i.test(id));
    const storefront = ids.findIndex((id) => /storefront/i.test(id));
    assert.ok(medallia >= 0);
    assert.ok(park > medallia && careeros > medallia && storefront > medallia);
  });
});

describe("recent roles", () => {
  it("puts a most-recent-first career list ahead of the jobs and leaves projects out", () => {
    const hits = retrieveResumeContext("What were your last two roles?");
    assert.match(hits[0].id, /career-order/);
    const order = hits[0].text;
    const medallia = order.indexOf("Medallia");
    const marathon = order.indexOf("Marathon");
    const nasdaq = order.indexOf("Nasdaq");
    assert.ok(medallia >= 0 && medallia < marathon && marathon < nasdaq);
    assert.equal(
      hits.some((hit) => /careeros|storefront|park/i.test(hit.id)),
      false,
    );
  });
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
    assert.match(MEG_SYSTEM_PROMPT, /does not list any/i);
    assert.match(MEG_SYSTEM_PROMPT, /character cap/i);
    assert.match(MEG_SYSTEM_PROMPT, /dashboard or report counts/i);
    assert.match(MEG_SYSTEM_PROMPT, /he\/him/i);
  });
});
