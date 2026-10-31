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

function excerpt(chunk: RankedChunk, maxLines = 5): string {
  const titleNorm = chunk.title.replace(/\s+/g, " ").trim().toLowerCase();
  const lines = chunk.text
    .replace(/^#+\s+/gm, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // Drop the heading line when it duplicates the title
    .filter((l) => l.replace(/\s+/g, " ").trim().toLowerCase() !== titleNorm);

  return lines.slice(0, maxLines).join("\n");
}

function pickHits(message: string): RankedChunk[] {
  const wantContact = CONTACT_HINT.test(message);
  const hits = getIndex()
    .search(message, 6)
    .filter((h) => (wantContact ? true : h.id !== "header"));
  return hits.slice(0, 3);
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

  const lines: string[] = ["Here’s what stands out from the resume:"];
  for (const h of hits) {
    const body = excerpt(h);
    lines.push("", h.title, body);
  }
  return lines.join("\n");
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
      const parts = text.match(/[\s\S]{1,100}/g) ?? [text];
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
