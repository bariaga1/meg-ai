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

const CONTACT_HINT =
  /\b(contact|email|reach|linkedin|hire|get\s+in\s+touch)\b/i;
const OFF_TOPIC =
  /\b(write\s+(me\s+)?(a\s+)?(poem|essay|homework)|leetcode|crypto\s+signal)\b/i;
const SKILLS_HINT =
  /\b(skills?|stack|technologies|tools?|competenc)/i;
const PROJECT_HINT =
  /\b(project|built|park|careeros|storefront|independent)\b/i;
const SUMMARY_HINT =
  /\b(summary|overview|about\s+(omega|him|her)|who\s+is|background|highlights?)\b/i;

function cleanLines(chunk: RankedChunk): string[] {
  const titleNorm = chunk.title.replace(/\s+/g, " ").trim().toLowerCase();
  return chunk.text
    .replace(/^#+\s+/gm, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => l.replace(/\s+/g, " ").trim().toLowerCase() !== titleNorm)
    .map((l) => l.replace(/^[-•*]\s+/, "").trim())
    .filter(Boolean);
}

function firstSentence(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const m = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  return m ? m[1] : trimmed;
}

function shortTitle(title: string): string {
  return title.split("|")[0]?.split("(")[0]?.trim() || title;
}

function employerFromJobTitle(title: string): string | null {
  const m = title.match(/—\s*([^—(]+)/);
  return m ? m[1].trim() : null;
}

function pickHits(message: string): RankedChunk[] {
  const wantContact = CONTACT_HINT.test(message);
  const hits = getIndex()
    .search(message, 6)
    .filter((h) => (wantContact ? true : h.id !== "header"));
  return hits.slice(0, 4);
}

function preferKind(hits: RankedChunk[], prefix: string): RankedChunk | null {
  return hits.find((h) => h.id.startsWith(prefix)) ?? null;
}

function answerJob(chunk: RankedChunk): string {
  const lines = cleanLines(chunk);
  const lead = lines.find((l) => !l.startsWith("Ran ") && l.length > 40) ?? lines[0] ?? "";
  const bullets = lines.filter((l) => l !== lead).slice(0, 3);
  const role = shortTitle(chunk.title);
  const employer = employerFromJobTitle(chunk.title);
  const where = employer ? ` at ${employer}` : "";
  const opener = `Omega was ${role}${where}.`;
  const body = lead ? ` ${firstSentence(lead)}` : "";
  if (bullets.length === 0) return `${opener}${body}`.trim();
  return [
    `${opener}${body}`,
    "",
    "A few concrete notes:",
    ...bullets.map((b) => `• ${b}`),
  ].join("\n");
}

function answerProject(chunk: RankedChunk): string {
  const lines = cleanLines(chunk);
  const name = shortTitle(chunk.title);
  const stackMatch = chunk.title.match(/\(([^)]+)\)/);
  const stack = stackMatch ? ` (${stackMatch[1]})` : "";
  const bits = lines.slice(0, 2);
  if (bits.length === 0) {
    return `${name}${stack} is one of Omega’s independent projects on the resume.`;
  }
  return [
    `${name}${stack} — here’s the short version:`,
    "",
    ...bits.map((b) => `• ${b}`),
  ].join("\n");
}

function answerSkills(chunk: RankedChunk): string {
  const lines = cleanLines(chunk);
  const picks = lines.slice(0, 4);
  if (picks.length === 0) {
    return "Omega’s resume lists programming, data integration, analytics, and AI tooling — ask about a specific area if you want detail.";
  }
  return [
    "Across roles, these skills show up most clearly:",
    "",
    ...picks.map((l) => `• ${l}`),
    "",
    "Happy to zoom into a role or project if that helps.",
  ].join("\n");
}

function answerSummary(chunk: RankedChunk): string {
  const lines = cleanLines(chunk);
  const sentences = lines
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (sentences.length === 0) {
    return "Omega is a technical implementation leader focused on applied AI and data integration — ask about a role or project for more.";
  }
  return `${sentences.join(" ")} Want a role, project, or skills deep-dive next?`;
}

function answerGeneric(hits: RankedChunk[]): string {
  const top = hits[0];
  if (!top) {
    return "I don’t see that on Omega’s resume. Try asking about Medallia, Marathon, Nasdaq/Calypso, skills, or the independent projects.";
  }
  if (top.id.startsWith("job-")) return answerJob(top);
  if (top.id.startsWith("project-")) return answerProject(top);
  if (top.id === "technical-skills" || top.id === "core-competencies") {
    return answerSkills(top);
  }
  if (top.id === "summary" || top.id === "career-highlights") {
    return answerSummary(top);
  }

  const lines = cleanLines(top).slice(0, 3);
  const heading = shortTitle(top.title);
  if (lines.length === 0) {
    return `I found “${heading}” on the resume, but not enough detail to summarize cleanly. Try a more specific question.`;
  }
  return [`On ${heading}:`, "", ...lines.map((l) => `• ${l}`)].join("\n");
}

/** Deterministic resume-grounded reply when the Cursor agent is unavailable. */
export function localMegReply(message: string): string {
  if (OFF_TOPIC.test(message)) {
    return "I stay on Omega’s resume and projects. Ask about roles, skills, or something like Can I Park Here?";
  }

  if (CONTACT_HINT.test(message)) {
    return [
      "You can reach Omega at omegabariagaber@gmail.com.",
      "LinkedIn is listed on the resume; phone isn’t shared here.",
    ].join("\n");
  }

  const hits = pickHits(message);
  if (hits.length === 0) {
    return "I don’t see that on Omega’s resume. Try asking about Medallia, Marathon, Nasdaq/Calypso, skills, or the independent projects.";
  }

  if (SKILLS_HINT.test(message)) {
    const skills =
      preferKind(hits, "technical-skills") ||
      hits.find((h) => h.id === "technical-skills" || h.id === "core-competencies") ||
      getIndex().search("technical skills python", 1)[0];
    if (skills) return answerSkills(skills);
  }

  if (PROJECT_HINT.test(message)) {
    const project = preferKind(hits, "project-");
    if (project) return answerProject(project);
  }

  if (SUMMARY_HINT.test(message)) {
    const summary =
      hits.find((h) => h.id === "summary" || h.id === "career-highlights") ||
      preferKind(hits, "summary");
    if (summary) return answerSummary(summary);
  }

  const job = preferKind(hits, "job-");
  if (job && /\b(medallia|marathon|nasdaq|calypso|saama|role|job|work|did|experience)\b/i.test(message)) {
    return answerJob(job);
  }

  return answerGeneric(hits);
}

/** NDJSON stream compatible with MegChat’s Agent SDK event expectations. */
export function localMegNdjsonStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const text = localMegReply(message);
  const sessionId = `local_${Date.now().toString(36)}`;
  const continuationToken = `local:${sessionId}`;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "session",
            sessionId,
            continuationToken,
            mode: "local",
          })}\n`,
        ),
      );
      const parts = text.match(/[\s\S]{1,80}/g) ?? [text];
      let index = 0;
      for (const delta of parts) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              type: "message.appended",
              index: index++,
              data: { delta },
            })}\n`,
          ),
        );
      }
      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "message.completed",
            index: index++,
            data: { text },
          })}\n`,
        ),
      );
      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "turn.completed",
            index: index++,
            data: {},
          })}\n`,
        ),
      );
      controller.close();
    },
  });
}

export function shouldUseLocalFallback(): boolean {
  if (process.env.MEG_FORCE_LOCAL === "1") return true;
  if (process.env.MEG_DISABLE_LOCAL_FALLBACK === "1") return false;
  return !process.env.AGENT_BASE_URL?.trim();
}
