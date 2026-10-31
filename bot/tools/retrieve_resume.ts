import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { Bm25Index } from "../lib/bm25.js";
import { loadResumeChunks } from "../lib/loadChunks.js";

let index: Bm25Index | null = null;

function getIndex(): Bm25Index {
  if (!index) index = new Bm25Index(loadResumeChunks());
  return index;
}

export default defineTool({
  description: prompt`
    Lexical (BM25-style) search over Omega Bariagaber’s resume section chunks.
    Call this before answering any factual question about skills, roles,
    projects, education, certifications, or career history.
    Returns the top matching sections with scores. Do not invent facts
    that are not present in the retrieved text.
  `,
  effect: "read",
  inputSchema: z.object({
    query: z
      .string()
      .min(2)
      .describe("Natural-language search query about the resume"),
    topK: z
      .number()
      .int()
      .min(1)
      .max(8)
      .optional()
      .describe("How many chunks to return (default 4)"),
  }),
  async execute({ query, topK }) {
    const hits = getIndex().search(query, topK ?? 4);
    return {
      query,
      hitCount: hits.length,
      chunks: hits.map((h) => ({
        id: h.id,
        title: h.title,
        tags: h.tags,
        score: Number(h.score.toFixed(4)),
        text: h.text,
      })),
    };
  },
});
