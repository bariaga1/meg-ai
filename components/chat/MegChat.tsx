"use client";

import { STARTERS, useMegChat } from "./useMegChat";

export function MegChat() {
  const {
    messages,
    input,
    setInput,
    busy,
    error,
    localMode,
    hasThread,
    placeholder,
    bottomRef,
    listRef,
    send,
    onSubmit,
  } = useMegChat();

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
            {localMode ? " · Local resume lookup (agent not connected)." : null}
          </p>
        </div>
      </main>
    </div>
  );
}
