/** Minimal BM25-style scorer for resume section chunks (no embeddings API). */

export type ResumeChunk = {
  id: string;
  title: string;
  tags: string[];
  text: string;
};

export type RankedChunk = ResumeChunk & { score: number };

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "as",
  "at",
  "by",
  "from",
  "that",
  "this",
  "it",
  "his",
  "her",
  "their",
  "what",
  "who",
  "how",
  "when",
  "where",
  "which",
  "about",
  "into",
  "over",
  "after",
  "before",
  "than",
  "then",
  "also",
  "can",
  "did",
  "does",
  "do",
  "has",
  "have",
  "had",
  "not",
  "but",
  "you",
  "your",
  "me",
  "my",
  "we",
  "our",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\s-]/g, " ")
    .split(/[\s/_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

type IndexedDoc = {
  chunk: ResumeChunk;
  tf: Map<string, number>;
  length: number;
};

export class Bm25Index {
  private docs: IndexedDoc[] = [];
  private docFreq = new Map<string, number>();
  private avgLen = 0;
  private readonly k1: number;
  private readonly b: number;

  constructor(chunks: ResumeChunk[], k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    for (const chunk of chunks) {
      const tokens = tokenize(`${chunk.title}\n${chunk.tags.join(" ")}\n${chunk.text}`);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      this.docs.push({ chunk, tf, length: tokens.length || 1 });
      for (const t of tf.keys()) {
        this.docFreq.set(t, (this.docFreq.get(t) ?? 0) + 1);
      }
    }
    this.avgLen =
      this.docs.reduce((s, d) => s + d.length, 0) / Math.max(this.docs.length, 1);
  }

  search(query: string, topK = 4): RankedChunk[] {
    const terms = [...new Set(tokenize(query))];
    if (terms.length === 0) return [];
    const N = this.docs.length;
    const scored = this.docs.map((doc) => {
      let score = 0;
      for (const t of terms) {
        const f = doc.tf.get(t) ?? 0;
        if (!f) continue;
        const df = this.docFreq.get(t) ?? 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const norm =
          f + this.k1 * (1 - this.b + (this.b * doc.length) / this.avgLen);
        score += (idf * f * (this.k1 + 1)) / norm;
      }
      // Light title/tag boost for exact term hits
      const titleTokens = new Set(tokenize(`${doc.chunk.title} ${doc.chunk.tags.join(" ")}`));
      for (const t of terms) {
        if (titleTokens.has(t)) score += 0.35;
      }
      return { ...doc.chunk, score };
    });
    return scored
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
