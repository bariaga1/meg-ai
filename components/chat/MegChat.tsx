"use client";

import { useEffect } from "react";
import { STARTERS, type MegChatState } from "./useMegChat";

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

/**
 * Meg's chat, sized to fill the site overlay panel. State is owned by the
 * caller so the thread survives the panel being minimized and reopened.
 */
export function MegChat({ chat }: { chat: MegChatState }) {
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
  } = chat;

  // Reopening the panel lands on the latest message, not the top of the thread.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [bottomRef]);

  return (
    <div className="meg-chat-embed relative flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-3">
        <span className="meg-online-dot" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--teal)]">
            Meg online
          </p>
          <p className="truncate text-sm text-[var(--meg-ink-soft)]">
            Ask about roles, skills, or projects.
          </p>
        </div>
      </div>

      <div className="meg-rise flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        {hasThread ? (
          <div
            ref={listRef}
            className="meg-thread mb-3 min-h-0 w-full flex-1 overflow-y-auto pr-1 text-left"
            aria-live="polite"
          >
            {messages.map((m) => {
              const isStreaming = m.id === streamingId;
              if (m.role === "user") {
                return (
                  <div key={m.id} className="meg-bubble meg-bubble--user">
                    {m.text}
                  </div>
                );
              }

              return (
                <div key={m.id} className="meg-bubble meg-bubble--meg">
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
        ) : (
          <div className="mb-3 flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-2 py-4">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => void send(s)}
                className="meg-chip"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="meg-composer mt-auto shrink-0 rounded-2xl p-2"
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
              className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-[var(--meg-ink)] outline-none placeholder:text-[var(--meg-ink-soft)]"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="retro-btn retro-btn--primary mb-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-2 shrink-0 text-center text-sm text-[var(--meg-coral)]" role="alert">
            {error}
          </p>
        )}

        <p className="mt-2 shrink-0 text-center text-[11px] text-[var(--meg-ink-soft)]">
          Answers come from the resume only. Phone is not shared.
          {localMode ? " · Local resume lookup (agent not connected)." : null}
        </p>
      </div>
    </div>
  );
}
