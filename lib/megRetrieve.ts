import { Bm25Index, type RankedChunk } from "../bot/lib/bm25";
import { loadResumeChunks } from "../bot/lib/loadChunks";

let index: Bm25Index | null = null;

function getIndex(): Bm25Index {
  if (!index) index = new Bm25Index(loadResumeChunks());
  return index;
}

const PROJECT_HINT =
  /\b(project|projects|independent|portfolio|built|side\s*project|can\s*i\s*park|careeros|storefront)\b/i;

const ROLE_HINT =
  /\b(role|roles|job|jobs|employer|employers|experience|career|worked|work\s+history|companies|company|positions?)\b/i;

const OTHER_ROLES_HINT =
  /\b(other\s+roles?|where\s+else|previous\s+roles?|prior\s+roles?|before\s+that|earlier\s+roles?|other\s+jobs?|other\s+employers?|anywhere\s+else)\b/i;

/** "last two roles" / "most recent job" — a count, not the whole career. */
const RECENT_ROLES_HINT =
  /\b(?:last|latest|most\s+recent|recent)\b(?:\s+\w+){0,4}\s+\b(?:roles?|jobs?|positions?|employers?)\b/i;

const FOLLOW_UP_HINT =
  /\b(else|other|another|more|anything\s+else|what\s+about|tell\s+me\s+more|and\s+then|before\s+that|previous|prior)\b/i;

const SKILL_HINT =
  /\b(skills?|python|typescript|javascript|node\.?js|sql|power\s*bi|tableau|salesforce|familiar|know|used|stack|tools?|cursor|claude|copilot)\b/i;

/** Broad AI work. Excludes “which AI coding tools” and a single named project. */
const AI_WORK_HINT =
  /\b(ai|a\.i\.|artificial intelligence|machine learning|llm|gpt|generative)\b/i;

const AI_TOOL_HINT = /\b(coding tools|ai tools|cursor|claude|copilot|chatgpt)\b/i;

const NAMED_PROJECT_HINT = /\b(can\s*i\s*park|park here|careeros|storefront)\b/i;

const SENTIMENT_HINT = /\bsentiment\b/i;

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

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/** End date in the job title, as year * 12 + month. Missing dates sort last. */
function endRecency(title: string): number {
  const found = [
    ...title.matchAll(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
    ),
  ];
  if (found.length === 0) return 0;
  const last = found[found.length - 1];
  return Number(last[2]) * 12 + (MONTH_INDEX[last[1].toLowerCase()] ?? 0);
}

function recentRoleCount(query: string): number {
  const word = query.match(/\b(one|1|two|2|three|3|four|4)\b/i);
  const counts: Record<string, number> = {
    one: 1,
    "1": 1,
    two: 2,
    "2": 2,
    three: 3,
    "3": 3,
    four: 4,
    "4": 4,
  };
  if (word) return counts[word[1].toLowerCase()] ?? 2;
  if (/\b(role|job|position|employer)\b/i.test(query) && !/\b(roles|jobs|positions|employers)\b/i.test(query)) {
    return 1;
  }
  return 2;
}

function recentJobChunks(count: number): RankedChunk[] {
  return allJobChunks()
    .slice()
    .sort((a, b) => endRecency(b.title) - endRecency(a.title))
    .slice(0, count);
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
  const recentCount = RECENT_ROLES_HINT.test(query) ? recentRoleCount(query) : null;
  if (recentCount != null) {
    return recentJobChunks(recentCount);
  }

  const wantAiPicture =
    (AI_WORK_HINT.test(query) || AI_WORK_HINT.test(searchQuery)) &&
    !AI_TOOL_HINT.test(query) &&
    !NAMED_PROJECT_HINT.test(query) &&
    !SENTIMENT_HINT.test(query);
  const wantProjects =
    wantAiPicture ||
    PROJECT_HINT.test(query) ||
    (FOLLOW_UP_HINT.test(query) && priorTalkedProjects && !OTHER_ROLES_HINT.test(query));
  const wantRoles =
    !wantAiPicture &&
    (OTHER_ROLES_HINT.test(query) ||
      (!wantSkills &&
        !wantEducation &&
        !wantContact &&
        (ROLE_HINT.test(query) ||
          (FOLLOW_UP_HINT.test(query) && priorTalkedRoles && !wantProjects))));

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
  if (wantAiPicture) {
    prefer(
      index
        .search("Medallia AI-assisted sentiment classification model 84%", 4)
        .filter((h) => /medallia/i.test(h.id)),
    );
    prefer(
      index
        .search("technical skills AI automation n8n LLM", 4)
        .filter((h) => h.id === "technical-skills"),
    );
  }
  if (wantRoles) {
    prefer(allJobChunks());
  }
  if (wantSkills) {
    const skills = index.search(
      `${query} technical skills Python TypeScript SQL Power BI Tableau Informatica`,
      8,
    );
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
    wantAiPicture || wantProjects || wantRoles
      ? Math.max(topK, 6)
      : wantSkills || wantEducation || wantContact
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
