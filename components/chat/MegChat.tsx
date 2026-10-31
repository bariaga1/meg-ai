"use client";

import { useEffect, useRef } from "react";
import { STARTERS, useMegChat } from "./useMegChat";

function LoadingState() {
  return (
    <div className="meg-loading" role="status" aria-label="Meg is thinking">
      <div className="space-y-2">
        <div className="meg-shimmer-bar w-[78%]" />
        <div className="meg-shimmer-bar w-[54%] [animation-delay:120ms]" />
        <div className="meg-shimmer-bar w-[36%] [animation-delay:240ms]" />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="meg-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="text-xs tracking-wide text-[var(--meg-ink-soft)]">Thinking…</span>
      </div>
    </div>
  );
}

export function MegChat() {
  const {
    messages,
    input,
    setInput,
    busy,
    error,
    localMode,
    hasThread,
    streamingId,
    placeholder,
    bottomRef,
    listRef,
    send,
    onSubmit,
  } = useMegChat();

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const onPointer = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      root.style.setProperty("--meg-px", x.toFixed(3));
      root.style.setProperty("--meg-py", y.toFixed(3));
    };

    const onLeave = () => {
      root.style.setProperty("--meg-px", "0");
      root.style.setProperty("--meg-py", "0");
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="meg-blob-layer absolute inset-0">
          <div className="meg-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(142,197,216,0.42)] blur-3xl" />
        </div>
        <div className="meg-blob-b absolute -right-16 top-28">
          <div className="meg-blob h-80 w-80 rounded-full bg-[rgba(47,143,157,0.24)] blur-3xl [animation-delay:-6s]" />
        </div>
        <div className="meg-blob-c absolute bottom-0 left-1/3">
          <div className="meg-blob h-64 w-64 rounded-full bg-[rgba(217,120,92,0.14)] blur-3xl [animation-delay:-11s]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
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
            {messages.map((m) => {
              const isStreaming = m.id === streamingId;
              if (m.role === "user") {
                return (
                  <div
                    key={m.id}
                    className="ml-8 rounded-2xl bg-[var(--meg-lagoon)] px-4 py-3 text-sm text-white shadow-[0_8px_24px_rgba(47,143,157,0.22)] sm:ml-16"
                  >
                    {m.text}
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="mr-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--meg-ink)] sm:mr-10"
                >
                  {!m.text && busy ? (
                    <LoadingState />
                  ) : (
                    <span className={isStreaming ? "meg-stream-text" : undefined}>
                      {m.text}
                      {isStreaming ? <span className="meg-caret" aria-hidden /> : null}
                    </span>
                  )}
                </div>
              );
            })}
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
                  className="meg-glass rounded-full px-3.5 py-2 text-left text-sm text-[var(--meg-ink-soft)] transition hover:border-[rgba(47,143,157,0.35)] hover:text-[var(--meg-ink)] disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="meg-composer meg-glass rounded-2xl bg-[var(--meg-glass-strong)] p-2"
          >
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
            {localMode ? " · Local resume lookup (agent not connected)." : null}
          </p>
        </div>
      </main>
    </div>
  );
}
