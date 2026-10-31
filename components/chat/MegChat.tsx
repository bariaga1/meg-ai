"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MegCharacter, type MegMood } from "./MegCharacter";
import { STARTERS, useMegChat } from "./useMegChat";

const WELCOME =
  "Hi — I’m Meg. Ask me anything on Omega Bariagaber’s resume: roles, skills, projects, or how to get in touch.";

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
  } = useMegChat();

  const [powered, setPowered] = useState(false);
  const [booting, setBooting] = useState(false);
  const [showWindow, setShowWindow] = useState(false);

  const powerOn = useCallback(() => {
    if (powered || booting) return;
    setBooting(true);
    window.setTimeout(() => {
      setPowered(true);
      setBooting(false);
      window.setTimeout(() => setShowWindow(true), 280);
    }, 120);
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

  const mood: MegMood = busy ? "thinking" : "idle";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

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
        <p className="absolute bottom-10 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-brown-gray)]">
          Move or tap to meet Meg
        </p>
      </div>
    );
  }

  return (
    <div className="meg-atmosphere relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="meg-blob absolute -left-20 top-10 h-64 w-64 rounded-full bg-[rgba(255,171,118,0.28)] blur-3xl" />
        <div className="meg-blob absolute -right-16 bottom-24 h-72 w-72 rounded-full bg-[rgba(255,216,177,0.45)] blur-3xl [animation-delay:-7s]" />
      </div>

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--meg-peach-dark)] sm:left-6 sm:top-5">
        <span className="meg-window__status-dot" aria-hidden />
        Meg online
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-3 flex flex-col items-center">
          <MegCharacter powered={powered} mood={mood} />
          <h1 className="mt-3 font-[family-name:var(--font-meg-display)] text-5xl font-extrabold tracking-tight text-[var(--meg-cocoa)] sm:text-6xl">
            Meg
          </h1>
        </div>

        {showWindow && (
          <section className="meg-window mt-2" role="region" aria-label="Chat with Meg">
            <header className="meg-window__header">
              <div className="meg-window__controls" aria-hidden>
                <span className="meg-window__control" />
                <span className="meg-window__control" />
                <span className="meg-window__control" />
              </div>
              <div className="meg-window__title">~/meg_resume.ai</div>
              <div className="meg-window__status">
                <span className="meg-window__status-dot" aria-hidden />
                {busy ? "thinking" : "ready"}
              </div>
            </header>

            <div ref={listRef} className="meg-window__body" aria-live="polite">
              <p className="meg-window__hint">try a starter below, or ask anything on the resume</p>

              <div className="meg-message">
                <div className="meg-message__label">&gt; meg</div>
                <div className="meg-message__content">{WELCOME}</div>
                {!hasThread && (
                  <div className="mt-3 flex flex-col items-start gap-2 pl-0.5 text-[13px] sm:flex-row sm:flex-wrap">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="meg-suggestion rounded-md px-1 py-1.5 text-left"
                        disabled={busy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void send(s);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "meg-message meg-message--user" : "meg-message"}
                >
                  <div className="meg-message__label">
                    {m.role === "user" ? "> you" : "> meg"}
                  </div>
                  <div className="meg-message__content">
                    {m.role === "assistant" && !m.text && busy ? (
                      <span className="inline-flex gap-1 text-[var(--meg-brown-gray)]">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse [animation-delay:120ms]">●</span>
                        <span className="animate-pulse [animation-delay:240ms]">●</span>
                      </span>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={onSubmit} className="meg-window__input-bar">
              <span className="meg-window__prompt" aria-hidden>
                &gt;
              </span>
              <label htmlFor="meg-input" className="sr-only">
                Message Meg
              </label>
              <input
                id="meg-input"
                type="text"
                value={input}
                disabled={busy}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(e) => setInput(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--meg-charcoal)] outline-none placeholder:text-[var(--meg-text-secondary)]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="meg-window__send"
              >
                send ↵
              </button>
            </form>
          </section>
        )}

        {error && (
          <p className="mt-3 text-sm text-[var(--meg-coral)]" role="alert">
            {error}
          </p>
        )}

        <p className="mt-5 max-w-md text-center text-[11px] leading-relaxed text-[var(--meg-text-secondary)]">
          Answers come from Omega’s resume only. Phone is not shared.
          {localMode ? " · Local resume lookup (agent not connected)." : null}
        </p>
      </main>
    </div>
  );
}
