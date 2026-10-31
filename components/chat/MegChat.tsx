"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

const STARTERS = [
  "What did Omega do at Medallia?",
  "Summarize the Can I Park Here? project",
  "Which skills show up across roles?",
  "How can I contact Omega?",
];

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type StreamEvent = {
  type?: string;
  index?: number;
  data?: {
    text?: string;
    delta?: string;
    result?: string;
  };
  text?: string;
  sessionId?: string;
  continuationToken?: string;
};

function extractAssistantDelta(ev: StreamEvent): string | null {
  if (ev.type === "message.appended") {
    return ev.data?.delta ?? ev.data?.text ?? ev.text ?? null;
  }
  if (ev.type === "message.completed") {
    return null;
  }
  return null;
}

function isTurnDone(ev: StreamEvent): boolean {
  return ev.type === "turn.completed" || ev.type === "turn.failed";
}

export function MegChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasThread = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const placeholder = useMemo(
    () => (hasThread ? "Ask a follow-up…" : "Ask Meg about Omega’s work…"),
    [hasThread],
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setBusy(true);
    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    const assistantId = uid();
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", text: "" }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId: sessionId ?? undefined,
          continuationToken: continuationToken ?? undefined,
          startIndex,
        }),
      });

      if (!res.ok || !res.body) {
        const json = (await res.json().catch(() => null)) as {
          message?: string;
          error?: string;
        } | null;
        throw new Error(json?.message || json?.error || `Chat failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let latestIndex = startIndex;
      let sawAssistant = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let ev: StreamEvent;
          try {
            ev = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }

          if (ev.type === "session" && ev.sessionId && ev.continuationToken) {
            setSessionId(ev.sessionId);
            setContinuationToken(ev.continuationToken);
            continue;
          }

          if (typeof ev.index === "number") {
            latestIndex = Math.max(latestIndex, ev.index + 1);
          }

          const delta = extractAssistantDelta(ev);
          if (delta) {
            sawAssistant = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: `${m.text}${delta}` } : m,
              ),
            );
          }

          if (ev.type === "message.completed" && ev.data?.text) {
            sawAssistant = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId && !m.text ? { ...m, text: ev.data!.text! } : m,
              ),
            );
          }

          if (ev.type === "turn.failed") {
            throw new Error(ev.data?.result || "Meg could not finish that turn.");
          }

          if (isTurnDone(ev)) {
            // keep reading briefly is unnecessary; agent stream stays open,
            // but we stop consuming after the turn so the UI unlocks.
            await reader.cancel();
            break;
          }
        }
      }

      setStartIndex(latestIndex);
      if (!sawAssistant) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.text
              ? {
                  ...m,
                  text: "I could not stream a reply. Is the Agent SDK server running?",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.text
            ? { ...m, text: `I hit a snag: ${message}` }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="meg-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(126,200,227,0.35)] blur-3xl" />
        <div className="meg-blob absolute -right-16 top-32 h-80 w-80 rounded-full bg-[rgba(42,157,143,0.22)] blur-3xl [animation-delay:-6s]" />
        <div className="meg-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[rgba(224,122,95,0.16)] blur-3xl [animation-delay:-11s]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-8 pt-10 sm:pt-16">
        <header className={`meg-rise ${hasThread ? "mb-6" : "mb-10 sm:mb-14"}`}>
          <p className="font-[family-name:var(--font-meg-display)] text-5xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-6xl md:text-7xl">
            Meg
          </p>
          {!hasThread && (
            <p className="meg-rise-delay mt-3 max-w-md text-base leading-relaxed text-[var(--meg-ink-soft)] sm:text-lg">
              Ask about Omega Bariagaber’s work — roles, skills, and projects from the resume.
            </p>
          )}
        </header>

        {hasThread && (
          <div
            ref={listRef}
            className="meg-rise mb-6 flex-1 space-y-4 overflow-y-auto pr-1"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-2xl bg-[var(--meg-lagoon)] px-4 py-3 text-sm text-white sm:ml-16"
                    : "mr-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--meg-ink)] sm:mr-10"
                }
              >
                {m.role === "assistant" && !m.text && busy ? (
                  <span className="inline-flex gap-1 text-[var(--meg-ink-soft)]">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:120ms]">●</span>
                    <span className="animate-pulse [animation-delay:240ms]">●</span>
                  </span>
                ) : (
                  m.text
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className={`meg-rise-delay-2 mt-auto ${hasThread ? "" : "flex-1"}`}>
          {!hasThread && (
            <div className="mb-5 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(s)}
                  className="rounded-full border border-[rgba(26,47,51,0.12)] bg-[var(--meg-surface)] px-3.5 py-2 text-left text-sm text-[var(--meg-ink-soft)] backdrop-blur transition hover:border-[var(--meg-lagoon)] hover:text-[var(--meg-ink)] disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="meg-composer rounded-2xl border border-[rgba(26,47,51,0.1)] bg-[var(--meg-surface)] p-2 shadow-[0_10px_40px_rgba(26,47,51,0.06)] backdrop-blur">
            <label htmlFor="meg-input" className="sr-only">
              Message Meg
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="meg-input"
                rows={1}
                value={input}
                disabled={busy}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-[15px] text-[var(--meg-ink)] outline-none placeholder:text-[var(--meg-ink-soft)]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="mb-1 rounded-xl bg-[var(--meg-lagoon)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--meg-lagoon-deep)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-3 text-sm text-[var(--meg-coral)]" role="alert">
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-[var(--meg-ink-soft)]">
            Answers come from Omega’s resume only. Phone is not shared.
          </p>
        </div>
      </main>
    </div>
  );
}
