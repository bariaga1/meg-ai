import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatResumeContext,
  retrieveResumeContext,
  retrievalQuery,
} from "../lib/megRetrieve";
import { MEG_SYSTEM_PROMPT } from "../lib/megPrompt";
import { SITE_HIGHLIGHTS } from "../lib/siteContent";
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

describe("overview questions", () => {
  it("leads accomplishment questions with Career Highlights and leaves side projects out", () => {
    for (const question of ["What are his accomplishments?", "What is he most proud of?", "What are his biggest wins?"]) {
      const ids = retrieveResumeContext(question).map((hit) => hit.id);
      assert.equal(ids[0], "career-highlights", question);
      assert.equal(ids.some((id) => /careeros|storefront|park/i.test(id)), false, question);
    }
  });

  it("keeps a named employer specific even with an achievement word", () => {
    const ids = retrieveResumeContext("What did he achieve at Medallia?").map((hit) => hit.id);
    assert.match(ids[0], /medallia/i);
  });

  it("falls back to labelled background when nothing matches", () => {
    const hits = retrieveResumeContext("What is his salary expectation?");
    assert.equal(hits[0].id, "no-direct-match");
    assert.deepEqual(hits.slice(1).map((hit) => hit.id), ["summary", "career-highlights"]);
    assert.match(formatResumeContext(hits), /does not cover it/);
  });
});

describe("role sections lead with impact", () => {
  it("gives Meg each role as pitch, ranked top impact, then supporting detail", () => {
    const medallia = retrieveResumeContext("What did you do at Medallia?").find((hit) => /medallia/i.test(hit.id));
    assert.ok(medallia);
    const text = medallia.text;
    const pitch = text.indexOf("Pitch:");
    const top = text.indexOf("Top impact:");
    const support = text.indexOf("Supporting detail:");
    assert.ok(pitch >= 0 && pitch < top && top < support, "sections in order");
    const headline = text.slice(top, support);
    assert.ok(headline.indexOf("$5M+") < headline.indexOf("25+ implementation") && headline.indexOf("25+ implementation") < headline.indexOf("10M+"), "ranked headline");
    assert.ok(text.indexOf("84% accuracy") > support, "sentiment model is supporting detail");
  });
});

describe("employment status", () => {
  it("puts Current Status ahead of any role list", () => {
    for (const question of ["Is he employed?", "What is his current role?", "Why did he leave Medallia?"]) {
      assert.equal(retrieveResumeContext(question)[0].id, "current-status", question);
    }
  });

  it("treats a project's availability as a project question", () => {
    const ids = retrieveResumeContext("Is CareerOS available to try?").map((hit) => hit.id);
    assert.equal(ids.includes("current-status"), false);
    assert.match(ids.join(" "), /careeros/);
  });
});

describe("highlight stories", () => {
  const isProject = (id: string) => id.startsWith("project-");

  it("gives Meg each story with the same words the site shows", () => {
    for (const item of SITE_HIGHLIGHTS) {
      const [story] = retrieveResumeContext(item.detail.ask, 4, [], { topic: item.id });
      assert.equal(story.id, `story-${item.id}`);
      for (const part of [item.detail.challenge, item.detail.action, item.detail.result]) {
        assert.ok(story.text.includes(part), `${item.id} story matches the site`);
      }
    }
  });

  it("answers an Ask Meg button with exactly its story and that job", () => {
    for (const item of SITE_HIGHLIGHTS) {
      const hits = retrieveResumeContext(item.detail.ask, 4, [], { topic: item.id });
      assert.equal(hits.length, 2, item.id);
      assert.match(hits[1].id, /^job-/);
      assert.match(hits[1].title, new RegExp(item.source.split(" ")[0], "i"), item.id);
    }
  });

  it("finds the story for typed questions, without side projects", () => {
    const cases: [string, string][] = [
      ...SITE_HIGHLIGHTS.map((item): [string, string] => [item.detail.ask, item.id]),
      ["How did he save the at-risk accounts?", "renewals"],
      ["Which Fortune 100 clients did he work with?", "implementations"],
      ["What data sources did his pipelines use?", "pipelines"],
      ["How did the overtime tracking app work?", "compliance-app"],
      ["How was the sentiment classifier built?", "sentiment-model"],
      ["How did he keep 97% SLA?", "offshore-teams"],
    ];
    for (const [question, id] of cases) {
      const ids = retrieveResumeContext(question).map((h) => h.id);
      assert.equal(ids[0], `story-${id}`, question);
      assert.equal(ids.some(isProject), false, question);
    }
  });

  it("keeps stories out of broad questions", () => {
    for (const question of [
      "What did you do at Medallia?",
      "What did you do at Marathon Petroleum?",
      "What are his accomplishments?",
      "What other roles did you have?",
      "Is he employed?",
    ]) {
      const ids = retrieveResumeContext(question).map((h) => h.id);
      assert.equal(ids.some((id) => id.startsWith("story-")), false, question);
    }
  });

  it("ignores an unknown topic and searches as usual", () => {
    const ids = retrieveResumeContext("What did you do at Medallia?", 4, [], { topic: "nope" }).map((h) => h.id);
    assert.match(ids[0], /medallia/);
  });
});

describe("life outside work", () => {
  it("answers hobby questions from Outside Work, without side projects", () => {
    for (const question of [
      "What does he do for fun?",
      "Does he have a dog?",
      "What are his hobbies?",
      "Does he play basketball?",
      "What does he do outside of work?",
      "Tell me about Sosa",
      "Does he work on cars?",
    ]) {
      const ids = retrieveResumeContext(question).map((h) => h.id);
      assert.equal(ids[0], "outside-work", question);
      assert.equal(ids.some((id) => id.startsWith("project-")), false, question);
    }
  });

  it("keeps hobbies out of work answers", () => {
    for (const question of [
      "Tell me about yourself",
      "What did you do at Medallia?",
      "How did he manage weekend deployments?",
      "How can I contact you?",
      "Where can I park my car with Can I Park Here?",
    ]) {
      const ids = retrieveResumeContext(question).map((h) => h.id);
      assert.equal(ids.includes("outside-work"), false, question);
    }
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
    assert.match(MEG_SYSTEM_PROMPT, /Highlight story/);
    assert.match(MEG_SYSTEM_PROMPT, /Outside Work section/);
    assert.match(MEG_SYSTEM_PROMPT, /Top impact points in the order listed/);
    assert.match(MEG_SYSTEM_PROMPT, /Keep Supporting detail for a follow-up/);
    assert.match(MEG_SYSTEM_PROMPT, /Current Status section/);
    assert.match(MEG_SYSTEM_PROMPT, /Do not describe any employer role as current/);
    assert.match(MEG_SYSTEM_PROMPT, /why a role ended/);
  });
});
