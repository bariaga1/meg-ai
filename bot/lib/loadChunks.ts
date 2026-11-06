import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ResumeChunk } from "./bm25.js";

type ChunksFile = { version: number; chunks: ResumeChunk[] };

function projectRoot(): string {
  // bot/lib -> repo root
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

function readChunks(filename: string): ResumeChunk[] {
  const path = join(projectRoot(), "content", filename);
  const raw = JSON.parse(readFileSync(path, "utf8")) as ChunksFile;
  if (!Array.isArray(raw.chunks)) {
    throw new Error(`No chunks array in ${path}`);
  }
  return raw.chunks;
}

/** Resume sections plus the independent-project source. */
export function loadResumeChunks(): ResumeChunk[] {
  const resume = readChunks("chunks.json");
  const projects = readChunks("project-chunks.json");
  if (resume.length === 0) {
    throw new Error("No resume chunks found");
  }
  const seen = new Set(resume.map((c) => c.id));
  const extra = projects.filter((c) => !seen.has(c.id));
  return [...resume, ...extra];
}

export function chunksPath(): string {
  return join(projectRoot(), "content", "chunks.json");
}
