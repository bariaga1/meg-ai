import type { RankedChunk } from "./bm25";
import { retrieveResumeContext } from "./megRetrieve";

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
  return retrieveResumeContext(message, 4);
}

/** Deterministic resume-grounded reply when AI Gateway is unavailable. */
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

/** Same NDJSON event shape as the Gateway stream, so MegChat handles both. */
export function localMegNdjsonStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const text = localMegReply(message);
  // Small token-ish chunks so the UI can paint progressively even without client buffering.
  const parts = text.match(/\S+\s*|\s+/g)?.filter(Boolean) ?? [text];

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "session",
            mode: "local",
          })}\n`,
        ),
      );

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
        // Soft pacing — keeps local mode from dumping the whole reply in one paint.
        await new Promise((r) => setTimeout(r, 12));
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
