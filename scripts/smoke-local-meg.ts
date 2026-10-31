import { localMegReply } from "../lib/localMeg.js";

const cases: Array<{ q: string; mustInclude: string; mustNotInclude?: string }> = [
  {
    q: "What did Omega do at Medallia?",
    mustInclude: "Medallia",
    mustNotInclude: "Here's what stands out from the resume",
  },
  {
    q: "Summarize the Can I Park Here? project",
    mustInclude: "Park",
    mustNotInclude: "Here's what stands out from the resume",
  },
  {
    q: "How can I contact Omega?",
    mustInclude: "omegabariagaber@gmail.com",
  },
  {
    q: "Write my college essay on Hamlet",
    mustInclude: "resume",
  },
];

let failed = 0;
for (const c of cases) {
  const reply = localMegReply(c.q);
  const ok =
    reply.includes(c.mustInclude) &&
    (!c.mustNotInclude || !reply.includes(c.mustNotInclude));
  console.log(`${ok ? "PASS" : "FAIL"}  ${JSON.stringify(c.q)}`);
  if (!ok) {
    failed += 1;
    console.log(reply.slice(0, 240));
  }
}

if (failed) {
  console.error(`smoke-local-meg: ${failed} failed`);
  process.exit(1);
}
console.log("smoke-local-meg: all passed");
