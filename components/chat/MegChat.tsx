"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MegCharacter, type MegMood } from "./MegCharacter";
import { STARTERS, useMegChat } from "./useMegChat";

/** The model sometimes writes markdown. The thread is plain text. */
function toPlainSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "");
}

function LoadingState() {
  return (
    <div className="meg-loading mx-auto" role="status" aria-label="Meg is thinking">
      <div className="space-y-2">
        <div className="meg-shimmer-bar w-[78%]" />
        <div className="meg-shimmer-bar w-[54%] [animation-delay:120ms]" />
        <div className="meg-shimmer-bar w-[36%] [animation-delay:240ms]" />
      </div>
      <div className="flex items-center justify-center gap-2.5">
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
  const [powered, setPowered] = useState(false);
  const [booting, setBooting] = useState(false);
  const [showUi, setShowUi] = useState(false);

  const powerOn = useCallback(() => {
    if (powered || booting) return;
    setBooting(true);
    window.setTimeout(() => {
      setPowered(true);
      setBooting(false);
      window.setTimeout(() => setShowUi(true), 220);
    }, 100);
  }, [powered, booting]);

  useEffect(() => {
    if (powered) return;
    const onFirst = () => powerOn();
    window.addEventListener("pointermove", onFirst, { once: true, passive: true });
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointermove", onFirst);
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, [powered, powerOn]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !powered) return;

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
  }, [powered]);

  const mood: MegMood = busy ? "thinking" : streamingId ? "speaking" : "idle";

  if (!powered) {
    return (
      <div
        className="meg-atmosphere meg-atmosphere--sleeping relative flex min-h-[100dvh] cursor-pointer flex-col items-center justify-center px-6"
        onClick={powerOn}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            powerOn();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Move or tap to meet Meg"
      >
        <div className="meg-sleepy-eyes mb-16" aria-hidden>
          <span className="meg-sleepy-eye" />
          <span className="meg-sleepy-eye" />
        </div>
        <p className="absolute bottom-10 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-ink-soft)]">
          Move or tap to meet Meg
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="meg-atmosphere relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="meg-blob-layer absolute inset-0">
          <div className="meg-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(110,168,186,0.34)] blur-3xl" />
        </div>
        <div className="meg-blob-b absolute -right-16 top-28">
          <div className="meg-blob h-80 w-80 rounded-full bg-[rgba(36,118,132,0.22)] blur-3xl [animation-delay:-6s]" />
        </div>
        <div className="meg-blob-c absolute bottom-0 left-1/3">
          <div className="meg-blob h-64 w-64 rounded-full bg-[rgba(180,96,72,0.12)] blur-3xl [animation-delay:-11s]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_55%)]" />
      </div>

      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--meg-lagoon)] sm:top-5">
        <span className="meg-online-dot" aria-hidden />
        Meg online
      </div>

      <main
        className={`relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 pb-8 pt-12 sm:pt-16 ${showUi ? "meg-rise" : "opacity-0"} ${hasThread ? "" : "justify-center"}`}
      >
        <header
          className={`mx-auto flex w-full max-w-md flex-col items-center justify-center text-center ${hasThread ? "mb-5" : "mb-7"}`}
        >
          <div className="flex w-full justify-center">
            <MegCharacter powered={powered} mood={mood} className="mx-auto mb-4" />
          </div>
          <p className="w-full text-center font-[family-name:var(--font-meg-display)] text-5xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-6xl">
            Meg
          </p>
          {!hasThread && (
            <p className="meg-rise-delay mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
              Ask about Omega’s work — roles, skills, or projects.
            </p>
          )}
        </header>

        {hasThread && (
          <div
            ref={listRef}
            className="meg-rise mb-6 w-full flex-1 space-y-4 overflow-y-auto pr-1 text-left"
            aria-live="polite"
          >
            {messages.map((m) => {
              const isStreaming = m.id === streamingId;
              if (m.role === "user") {
                return (
                  <div
                    key={m.id}
                    className="ml-auto max-w-[85%] rounded-2xl bg-[var(--meg-lagoon)] px-4 py-3 text-sm text-white shadow-[0_8px_24px_rgba(47,143,157,0.22)]"
                  >
                    {m.text}
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="mr-auto max-w-[92%] whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--meg-ink)]"
                >
                  {!m.text && busy ? (
                    <LoadingState />
                  ) : (
                    <span className={isStreaming ? "meg-stream-text" : undefined}>
                      {toPlainSpeech(m.text)}
                      {isStreaming ? <span className="meg-caret" aria-hidden /> : null}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        <div className={`meg-rise-delay-2 w-full ${hasThread ? "" : ""}`}>
          {!hasThread && (
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(s)}
                  className="meg-glass rounded-full px-3.5 py-2 text-center text-sm text-[var(--meg-ink-soft)] transition hover:border-[rgba(47,143,157,0.35)] hover:text-[var(--meg-ink)] disabled:opacity-50"
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
            <p className="mt-3 text-center text-sm text-[var(--meg-coral)]" role="alert">
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-[var(--meg-ink-soft)]">
            Answers come from the resume only. Phone is not shared.
            {localMode ? " · Local resume lookup (agent not connected)." : null}
          </p>
        </div>
      </main>
    </div>
  );
}
