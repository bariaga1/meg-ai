import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Bm25Index, type ResumeChunk } from "../bot/lib/bm25";

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

/** Deterministic resume-grounded reply when the Cursor agent is unavailable. */
export function localMegReply(message: string): string {
  if (OFF_TOPIC.test(message)) {
    return "I stay on Omega’s resume and projects. Ask about roles, skills, or something like Can I Park Here?";
  }

  const hits = getIndex().search(message, 3);
  if (hits.length === 0) {
    return "I don’t see that on Omega’s resume. Try asking about Medallia, Marathon, Nasdaq/Calypso, skills, or the independent projects.";
  }

  const lines: string[] = [];
  if (CONTACT_HINT.test(message)) {
    lines.push(
      "You can reach Omega at omegabariagaber@gmail.com (LinkedIn is listed on the resume header). Phone isn’t shared here.",
      "",
    );
  }

  lines.push("Here’s what the resume says that’s most relevant:");
  for (const h of hits) {
    const excerpt = h.text
      .replace(/^#+\s+/gm, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join("\n");
    lines.push("", `**${h.title}**`, excerpt);
  }
  lines.push(
    "",
    "_Local resume lookup (lexical RAG). Full Meg replies via the Cursor agent when deployed._",
  );
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
          })}\n`,
        ),
      );
      // Emit as a few deltas so the UI feels alive
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
