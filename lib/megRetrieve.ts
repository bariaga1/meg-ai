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

const ROLE_HINT =
  /\b(role|roles|job|jobs|employer|employers|experience|career|worked|work\s+history|companies|company|positions?)\b/i;

const OTHER_ROLES_HINT =
  /\b(other\s+roles?|where\s+else|previous\s+roles?|prior\s+roles?|before\s+that|earlier\s+roles?|other\s+jobs?|other\s+employers?|anywhere\s+else)\b/i;

const FOLLOW_UP_HINT =
  /\b(else|other|another|more|anything\s+else|what\s+about|tell\s+me\s+more|and\s+then|before\s+that|previous|prior)\b/i;

const SKILL_HINT =
  /\b(skills?|python|typescript|javascript|node\.?js|sql|power\s*bi|tableau|salesforce|familiar|know|used|stack|tools?|cursor|claude|copilot)\b/i;

const EDUCATION_HINT =
  /\b(school|college|university|studied|study|degree|education|michigan\s+state)\b/i;

const PROFILE_HINT =
  /\b(remote|location|based|linkedin|email|contact|reach|phone|hire|get\s+in\s+touch)\b/i;

export type HistoryTurn = { role: "user" | "assistant"; text: string };

function isProjectChunk(h: RankedChunk): boolean {
  return h.tags.includes("project") || /project/i.test(h.id);
}

function isJobChunk(h: RankedChunk): boolean {
  return h.tags.includes("job") || h.tags.includes("experience") || /^job-/i.test(h.id);
}

/** Combine follow-up with recent user turns so short asks still retrieve. */
export function retrievalQuery(message: string, history: HistoryTurn[] = []): string {
  // “What other roles?” after a Medallia turn must not re-search Medallia.
  if (OTHER_ROLES_HINT.test(message) || (FOLLOW_UP_HINT.test(message) && ROLE_HINT.test(message))) {
    return "professional experience roles Medallia Marathon Petroleum Nasdaq Calypso Saama";
  }

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
  return getIndex()
    .search("independent projects Can I Park Here CareerOS Storefront Studio", 12)
    .filter(isProjectChunk);
}

function allJobChunks(): RankedChunk[] {
  return getIndex()
    .search(
      "professional experience Senior Technical Consultant Medallia Marathon Petroleum Nasdaq Calypso Saama Business Analyst Infrastructure Quality Engineer",
      12,
    )
    .filter(isJobChunk);
}

/** Top resume sections for a recruiter question (lexical, no embeddings). */
export function retrieveResumeContext(
  query: string,
  topK = 4,
  history: HistoryTurn[] = [],
): RankedChunk[] {
  const searchQuery = retrievalQuery(query, history);
  const wantContact = PROFILE_HINT.test(query) || PROFILE_HINT.test(searchQuery);
  const wantSkills = SKILL_HINT.test(query);
  const wantEducation = EDUCATION_HINT.test(query);
  const priorTalkedProjects = history.some(
    (t) => PROJECT_HINT.test(t.text) || /park here|careeros|storefront/i.test(t.text),
  );
  const priorTalkedRoles = history.some(
    (t) =>
      ROLE_HINT.test(t.text) ||
      /medallia|marathon|nasdaq|calypso|saama/i.test(t.text),
  );
  const wantProjects =
    PROJECT_HINT.test(query) ||
    (FOLLOW_UP_HINT.test(query) && priorTalkedProjects && !OTHER_ROLES_HINT.test(query));
  const wantRoles =
    OTHER_ROLES_HINT.test(query) ||
    (!wantSkills &&
      !wantEducation &&
      !wantContact &&
      (ROLE_HINT.test(query) ||
        (FOLLOW_UP_HINT.test(query) && priorTalkedRoles && !wantProjects)));

  const index = getIndex();
  const ranked = index
    .search(searchQuery, 10)
    .filter((h) => (wantContact ? true : h.id !== "header"));

  const byId = new Map<string, RankedChunk>();
  const prefer = (chunks: RankedChunk[]) => {
    for (const h of chunks) {
      if (!byId.has(h.id)) byId.set(h.id, h);
    }
  };

  if (wantProjects) {
    prefer(allProjectChunks());
  }
  if (wantRoles) {
    prefer(allJobChunks());
  }
  if (wantSkills) {
    const skills = index.search("technical skills Python TypeScript Power BI", 8);
    prefer(skills.filter((h) => h.id === "technical-skills" || h.tags.includes("skills")));
    prefer(skills);
  }
  if (wantEducation) {
    prefer(index.search("Michigan State University education degree", 6));
  }
  if (wantContact) {
    prefer(index.search("Omega Bariagaber email LinkedIn Remote contact", 6));
  }

  prefer(ranked);

  if (byId.size === 0) {
    return ranked.slice(0, topK);
  }

  const limit =
    wantProjects || wantRoles ? Math.max(topK, 6) : wantSkills || wantEducation || wantContact
      ? Math.max(topK, 5)
      : topK;
  return [...byId.values()].slice(0, limit);
}

export function formatResumeContext(hits: RankedChunk[]): string {
  if (hits.length === 0) {
    return "(No matching resume sections for this question.)";
  }
  return hits
    .map((h) => `### ${h.title}\n${h.text.trim()}`)
    .join("\n\n");
}
