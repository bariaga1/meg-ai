import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ResumeChunk } from "./bm25.js";

type ChunksFile = { version: number; chunks: ResumeChunk[] };

function projectRoot(): string {
  // bot/lib -> repo root
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

export function loadResumeChunks(): ResumeChunk[] {
  const path = join(projectRoot(), "content", "chunks.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as ChunksFile;
  if (!Array.isArray(raw.chunks) || raw.chunks.length === 0) {
    throw new Error(`No resume chunks found at ${path}`);
  }
  return raw.chunks;
}

export function chunksPath(): string {
  return join(projectRoot(), "content", "chunks.json");
}
