import type { ResumeChunk } from "./bm25.js";
import resumeFile from "../content/chunks.json";
import projectFile from "../content/project-chunks.json";
import { SITE_HIGHLIGHTS, type SiteHighlight } from "./siteContent";

type ChunksFile = { version: number; chunks: ResumeChunk[] };

/**
 * Imported, not read from disk. A dynamic readFile of content/*.json is
 * omitted from the Vercel function bundle, and /api/chat then 500s with ENOENT.
 */
function asChunks(file: ChunksFile, label: string): ResumeChunk[] {
  if (!Array.isArray(file.chunks)) {
    throw new Error(`No chunks array in ${label}`);
  }
  return file.chunks;
}

/**
 * One section per career highlight box, built from the same data the site
 * shows, so Meg and the site always tell the same story.
 */
export function storyChunk(item: SiteHighlight): ResumeChunk {
  const { detail } = item;
  return {
    id: `story-${item.id}`,
    title: `Highlight story: ${item.metric} ${item.unit}`,
    tags: ["story", ...detail.keywords],
    text: [
      `Employer: ${item.source}`,
      `${item.metric} ${item.unit}.`,
      `Challenge: ${detail.challenge}`,
      `What he did: ${detail.action}`,
      `Result: ${detail.result}`,
      `Skills: ${detail.tags.join(", ")}.`,
    ].join("\n"),
  };
}

/** Resume sections, the highlight stories, and the independent-project source. */
export function loadResumeChunks(): ResumeChunk[] {
  const resume = asChunks(resumeFile, "content/chunks.json");
  const projects = asChunks(projectFile, "content/project-chunks.json");
  if (resume.length === 0) {
    throw new Error("No resume chunks found");
  }
  const stories = SITE_HIGHLIGHTS.map(storyChunk);
  const seen = new Set([...resume, ...stories].map((chunk) => chunk.id));
  const extra = projects.filter((chunk) => !seen.has(chunk.id));
  return [...resume, ...stories, ...extra];
}
