import { Bm25Index } from "../bot/lib/bm25.js";
import { loadResumeChunks } from "../bot/lib/loadChunks.js";

const cases: Array<{ q: string; expectIdIncludes: string }> = [
  { q: "Medallia Power BI dashboards", expectIdIncludes: "medallia" },
  { q: "Can I Park Here OCR parking", expectIdIncludes: "park" },
  { q: "Michigan State University education", expectIdIncludes: "education" },
  { q: "Python TypeScript skills", expectIdIncludes: "technical-skills" },
  { q: "Nasdaq Calypso trading QA", expectIdIncludes: "nasdaq" },
];

const index = new Bm25Index(loadResumeChunks());
let failed = 0;

for (const c of cases) {
  const hits = index.search(c.q, 3);
  const top = hits[0];
  const ok = Boolean(top && top.id.includes(c.expectIdIncludes));
  console.log(
    `${ok ? "PASS" : "FAIL"}  q=${JSON.stringify(c.q)}  top=${top?.id ?? "(none)"}  score=${top?.score.toFixed(3) ?? "-"}`,
  );
  if (!ok) failed += 1;
}

if (failed > 0) {
  console.error(`smoke-retrieve: ${failed} case(s) failed`);
  process.exit(1);
}
console.log("smoke-retrieve: all cases passed");
