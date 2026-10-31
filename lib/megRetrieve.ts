import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Bm25Index, type RankedChunk, type ResumeChunk } from "../bot/lib/bm25";

type ChunksFile = { version: number; chunks: ResumeChunk[] };

let index: Bm25Index | null = null;

function getIndex(): Bm25Index {
  if (!index) {
    const path = join(process.cwd(), "content", "chunks.json");
    const raw = JSON.parse(readFileSync(path, "utf8")) as ChunksFile;
    index = new Bm25Index(raw.chunks);
  }
  return index;
}

const PROJECT_HINT =
  /\b(project|projects|independent|portfolio|built|side\s*project|can\s*i\s*park|careeros|storefront)\b/i;

const FOLLOW_UP_HINT =
  /\b(else|other|another|more|anything\s+else|what\s+about|tell\s+me\s+more|and\s+then)\b/i;

export type HistoryTurn = { role: "user" | "assistant"; text: string };

function isProjectChunk(h: RankedChunk): boolean {
  return h.tags.includes("project") || /project/i.test(h.id);
}

/** Combine follow-up with recent user turns so “what else?” still retrieves. */
export function retrievalQuery(message: string, history: HistoryTurn[] = []): string {
  const recentUser = history
    .filter((t) => t.role === "user")
    .map((t) => t.text)
    .slice(-3)
    .join(" ");
  if (FOLLOW_UP_HINT.test(message) && recentUser) {
    return `${recentUser}\n${message}`;
  }
  return message;
}

function allProjectChunks(): RankedChunk[] {
  const index = getIndex();
  return index
    .search("independent projects Can I Park Here CareerOS Storefront Studio", 12)
    .filter(isProjectChunk);
}

/** Top resume sections for a recruiter question (lexical, no embeddings). */
export function retrieveResumeContext(
  query: string,
  topK = 4,
  history: HistoryTurn[] = [],
): RankedChunk[] {
  const searchQuery = retrievalQuery(query, history);
  const wantContact = /\b(contact|email|reach|linkedin|hire|get\s+in\s+touch)\b/i.test(
    searchQuery,
  );
  const priorTalkedProjects = history.some(
    (t) => PROJECT_HINT.test(t.text) || /park here|careeros|storefront/i.test(t.text),
  );
  const wantProjects =
    PROJECT_HINT.test(searchQuery) ||
    (FOLLOW_UP_HINT.test(query) && priorTalkedProjects);

  const index = getIndex();
  const ranked = index
    .search(searchQuery, 10)
    .filter((h) => (wantContact ? true : h.id !== "header"));

  if (wantProjects) {
    const byId = new Map<string, RankedChunk>();
    for (const h of [...allProjectChunks(), ...ranked]) {
      if (!byId.has(h.id)) byId.set(h.id, h);
    }
    // Include every known project chunk so “what else?” cannot invent extras.
    return [...byId.values()].slice(0, Math.max(topK, 6));
  }

  return ranked.slice(0, topK);
}

export function formatResumeContext(hits: RankedChunk[]): string {
  if (hits.length === 0) {
    return "(No matching resume sections for this question.)";
  }
  return hits
    .map((h) => `### ${h.title}\n${h.text.trim()}`)
    .join("\n\n");
}
