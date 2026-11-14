import type { ResumeChunk } from "./bm25.js";
import resumeFile from "../content/chunks.json";
import projectFile from "../content/project-chunks.json";

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

/** Resume sections plus the independent-project source. */
export function loadResumeChunks(): ResumeChunk[] {
  const resume = asChunks(resumeFile, "content/chunks.json");
  const projects = asChunks(projectFile, "content/project-chunks.json");
  if (resume.length === 0) {
    throw new Error("No resume chunks found");
  }
  const seen = new Set(resume.map((chunk) => chunk.id));
  const extra = projects.filter((chunk) => !seen.has(chunk.id));
  return [...resume, ...extra];
}
