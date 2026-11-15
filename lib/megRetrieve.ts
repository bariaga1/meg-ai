import { Bm25Index, type RankedChunk } from "./bm25";
import { loadResumeChunks } from "./loadChunks";

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

const FOLLOW_UP_HINT =
  /\b(else|other|another|more|anything\s+else|what\s+about|tell\s+me\s+more|and\s+then|before\s+that|previous|prior)\b/i;

const SKILL_HINT =
  /\b(skills?|python|typescript|javascript|node\.?js|sql|power\s*bi|tableau|salesforce|familiar|know|used|stack|tools?|cursor|claude|copilot)\b/i;

/** Soft skills / competencies; “strengths” is not in the chunk text. */
const STRENGTH_HINT =
  /\b(strengths?|competenc(?:y|ies)|strong\s+at|good\s+at|best\s+at|what\s+(is|are)\s+he\s+known\s+for)\b/i;

/** Skills that repeat across the career, not a single tool. */
const ACROSS_ROLES_HINT =
  /\b(across\s+(his\s+|the\s+)?(roles?|jobs?|employers?|positions?|career)|throughout\s+(his\s+)?career|in\s+common|show(?:s|ed)?\s+up)\b/i;

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

/** A personal weakness. Not a tool limit such as a character cap or a rate limit. */
const WEAKNESS_HINT =
  /\b(short\s*comings?|weakness(?:es)?|downsides?|limitations?|failures?|struggles?|not\s+good\s+at|room\s+for\s+improvement)\b/i;

/**
 * Accomplishment questions. The resume says "Career Highlights" and "delivered",
 * never "accomplishments" or "achievements", so keyword search alone finds nothing.
 */
const ACHIEVEMENT_HINT =
  /\b(accomplish(?:ed|ments?)|achiev(?:e|ed|ements?)|proud|wins?|successes|successful|biggest\s+impact|track\s+record|best\s+work|stand\s*outs?)\b/i;

/** "Tell me about yourself"-style openers: nothing searchable is left after stop words. */
const INTRO_HINT =
  /\b(tell\s+me\s+about\s+(yourself|him|omega)|about\s+yourself|who\s+(is|are)\s+(he|you|omega)|what\s+(does|do)\s+(he|you|omega)\s+do)\b/i;

/** Employment status, availability, and why the last role ended. Answered by Current Status. */
const STATUS_HINT =
  /\b(employed|employment|unemployed|(currently|now)\s+(working|employed)|working\s+(now|currently|right\s+now)|current(?:ly)?\s+(role|job|position|employer|status|situation)|available|availability|open\s+to\s+(work|new|roles?|opportunit\w*)|looking\s+for\s+(a\s+)?(job|role|work|position|opportunit\w*)|job\s+(search|hunting)|start\s+date|when\s+can\s+(he|you)\s+start|notice\s+period|doing\s+(now|these\s+days|right\s+now)|laid\s+off|lay\s*offs?|why\s+did\s+(he|you)\s+leave|(leave|left)\s+medallia|career\s+gap|gap\s+in)\b/i;

/** A named employer, project or topic: a precise question, not an overview. */
const SPECIFIC_HINT =
  /\b(medallia|marathon|nasdaq|calypso|saama|park\s+here|careeros|storefront|sentiment|power\s*bi|tableau|python|sql)\b/i;

export type HistoryTurn = { role: "user" | "assistant"; text: string };

let sectionMap: Map<string, RankedChunk> | null = null;

/** Fixed sections by id (score 0), for questions that need them regardless of keywords. */
function sections(...ids: string[]): RankedChunk[] {
  if (!sectionMap) {
    sectionMap = new Map(loadResumeChunks().map((c) => [c.id, { ...c, score: 0 }]));
  }
  return ids.flatMap((id) => sectionMap?.get(id) ?? []);
}

/** Tells the model the fallback sections are background, not a direct answer. */
const NO_DIRECT_MATCH: RankedChunk = {
  id: "no-direct-match",
  title: "Note: no section matched this question directly",
  tags: ["note"],
  score: 0,
  text: "No resume section matched this question directly. The sections below are general background. Use them only if they actually answer the question; otherwise say the resume does not cover it.",
};

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

  const recentUserTurns = history.filter((t) => t.role === "user").map((t) => t.text);
  const recentUser = recentUserTurns.slice(-3).join(" ");
  if (/^[\s?.!]+$/.test(message.trim()) && recentUserTurns.length > 0) {
    return recentUserTurns[recentUserTurns.length - 1];
  }
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

function orderedJobChunks(): RankedChunk[] {
  return allJobChunks()
    .slice()
    .sort((a, b) => endRecency(b.title) - endRecency(a.title));
}

/** Short dated list so the model can answer order and count questions. */
function careerOrderChunk(): RankedChunk {
  const lines = orderedJobChunks().map((job, index) => `${index + 1}. ${job.title}`);
  return {
    id: "career-order",
    title: "Career order (most recent first)",
    tags: ["career-order"],
    score: 0,
    text: `Career order, most recent first. Use this list for questions about sequence, counts, the last role, the first role, or what came before or after.\n${lines.join("\n")}`,
  };
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
  const wantStrengths = STRENGTH_HINT.test(query) || STRENGTH_HINT.test(searchQuery);
  const acrossRoles = ACROSS_ROLES_HINT.test(query) || ACROSS_ROLES_HINT.test(searchQuery);
  const wantEducation = EDUCATION_HINT.test(query);
  const priorTalkedProjects = history.some(
    (t) => PROJECT_HINT.test(t.text) || /park here|careeros|storefront/i.test(t.text),
  );
  const priorTalkedRoles = history.some(
    (t) =>
      ROLE_HINT.test(t.text) ||
      /medallia|marathon|nasdaq|calypso|saama/i.test(t.text),
  );
  const wantWeakness = WEAKNESS_HINT.test(query) || WEAKNESS_HINT.test(searchQuery);
  const askedProjects =
    PROJECT_HINT.test(query) ||
    (FOLLOW_UP_HINT.test(query) && priorTalkedProjects && !OTHER_ROLES_HINT.test(query));
  const wantAiPicture =
    !wantWeakness &&
    !(askedProjects && !AI_WORK_HINT.test(query)) &&
    (AI_WORK_HINT.test(query) || AI_WORK_HINT.test(searchQuery)) &&
    !AI_TOOL_HINT.test(query) &&
    !NAMED_PROJECT_HINT.test(query) &&
    !SENTIMENT_HINT.test(query);
  const wantProjects = askedProjects;
  const wantRoles =
    !wantAiPicture &&
    !wantStrengths &&
    (OTHER_ROLES_HINT.test(query) ||
      (!wantSkills &&
        !wantEducation &&
        !wantContact &&
        (ROLE_HINT.test(query) ||
          (FOLLOW_UP_HINT.test(query) && priorTalkedRoles && !wantProjects))));
  // Overview questions lead with Career Highlights / Summary, but only when the
  // question isn't about something specific that keyword search will find.
  const isSpecific =
    SPECIFIC_HINT.test(query) ||
    wantRoles ||
    wantSkills ||
    wantEducation ||
    wantContact ||
    askedProjects ||
    wantAiPicture ||
    wantStrengths ||
    wantWeakness;
  // "Is CareerOS available?" is about a project, not about Omega's availability.
  const wantStatus = STATUS_HINT.test(query) && !NAMED_PROJECT_HINT.test(query);
  const wantAchievements = !isSpecific && ACHIEVEMENT_HINT.test(query);
  const wantIntro = !isSpecific && INTRO_HINT.test(query);

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

  // Status first, with the role that ended for context. Before any role list,
  // so the model never reads the most recent job as the current one.
  if (wantStatus) {
    prefer(sections("current-status"));
    prefer(orderedJobChunks().slice(0, 1));
  }

  if (wantAchievements) {
    prefer(sections("career-highlights", "summary"));
  } else if (wantIntro) {
    prefer(sections("summary", "career-highlights"));
  }

  if (wantStrengths) {
    prefer(
      index
        .search("core competencies strengths stakeholder consulting implementations", 6)
        .filter(
          (h) =>
            h.id === "core-competencies" ||
            h.tags.includes("competencies") ||
            h.tags.includes("strengths"),
        ),
    );
    prefer(
      index
        .search("professional summary career highlights", 4)
        .filter((h) => h.id === "summary" || h.id === "career-highlights"),
    );
  }

  if (wantWeakness) {
    prefer(
      index
        .search("professional summary career highlights", 6)
        .filter((h) => h.id === "summary" || h.id === "career-highlights"),
    );
    prefer(
      index
        .search("Medallia Senior Technical Consultant", 4)
        .filter((h) => /medallia/i.test(h.id)),
    );
  }
  if (wantAiPicture) {
    prefer(
      index
        .search("Medallia AI-assisted sentiment classification model 84%", 4)
        .filter((h) => /medallia/i.test(h.id)),
    );
    prefer(allProjectChunks());
    prefer(
      index
        .search("technical skills AI automation n8n LLM", 4)
        .filter((h) => h.id === "technical-skills"),
    );
  } else if (askedProjects) {
    prefer(allProjectChunks());
  }
  if (wantRoles) {
    prefer([careerOrderChunk(), ...orderedJobChunks()]);
  }
  if (wantSkills && acrossRoles) {
    prefer(
      index
        .search("technical skills programming SQL Python JavaScript scripts", 4)
        .filter((h) => h.id === "technical-skills"),
    );
    prefer(orderedJobChunks());
  } else if (wantSkills) {
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

  const tail =
    // Side projects aren't career accomplishments; keep stray keyword hits out.
    wantRoles || wantWeakness || wantAchievements || wantIntro || wantStatus
      ? ranked.filter((hit) => !isProjectChunk(hit))
      : acrossRoles
        ? ranked.filter((hit) => hit.id !== "summary" && !isProjectChunk(hit))
        : wantAiPicture || askedProjects
          ? ranked.filter((hit) => hit.id !== "summary")
          : ranked;
  prefer(tail);

  // Nothing matched (vague or unusual phrasing): give the model general
  // background with a note, instead of an empty context.
  if (byId.size === 0) {
    return [NO_DIRECT_MATCH, ...sections("summary", "career-highlights")];
  }

  const limit =
    acrossRoles
      ? 1 + orderedJobChunks().length
      : wantRoles
      ? 1 + orderedJobChunks().length + 3
      : wantStrengths
      ? Math.max(topK, 3)
      : wantWeakness
      ? 3
      : wantAiPicture
      ? Math.max(topK, 6)
      : wantProjects
      ? Math.max(topK, 4)
      : wantSkills || wantEducation || wantContact
        ? Math.max(topK, 5)
        : topK;
  // Current Status is short and full of names (Medallia, the projects), so it
  // outranks the real section on keywords. Only status questions get it.
  return [...byId.values()]
    .filter((h) => wantStatus || h.id !== "current-status")
    .slice(0, limit);
}

export function formatResumeContext(hits: RankedChunk[]): string {
  if (hits.length === 0) {
    return "(No matching resume sections for this question.)";
  }
  return hits
    .map((h) => `### ${h.title}\n${h.text.trim()}`)
    .join("\n\n");
}
