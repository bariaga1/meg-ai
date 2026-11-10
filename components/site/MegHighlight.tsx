"use client";

import { MegChat } from "@/components/chat/MegChat";
import { MegCharacter } from "@/components/chat/MegCharacter";

type MegHighlightProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function MegHighlight({ open, onOpen, onClose }: MegHighlightProps) {
  return (
    <section id="meg" className="site-section scroll-mt-20 pt-2">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onOpen}
          className="site-meg-feature group flex w-full flex-col gap-6 rounded-[1.75rem] px-6 py-7 text-left transition sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8"
        >
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <div className="site-meg-orb hidden sm:grid">
              <MegCharacter powered mood="idle" className="meg-character--embed" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--site-feature-muted)]">
                Live · text agent
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Chat with Meg
              </h2>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--site-feature-muted)]">
                Meet the version that never sleeps. Ask about roles, skills, or
                projects — grounded in the public resume.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--meg-ink)] transition group-hover:scale-[1.02]">
            Let&apos;s talk
          </span>
        </button>
      </div>

      {open ? (
        <div className="site-meg-overlay" role="dialog" aria-modal="true" aria-label="Chat with Meg">
          <button
            type="button"
            className="site-meg-overlay__backdrop"
            aria-label="Close Meg"
            onClick={onClose}
          />
          <div className="site-meg-overlay__panel">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--site-line)] px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-lagoon)]">
                  Live · text agent
                </p>
                <p className="font-[family-name:var(--font-meg-display)] text-xl font-semibold text-[var(--meg-ink)]">
                  Meg
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[var(--site-line)] px-3.5 py-1.5 text-sm font-semibold text-[var(--meg-ink)] transition hover:border-[var(--meg-ink)]"
              >
                Close
              </button>
            </div>
            <div className="site-meg-overlay__chat">
              <MegChat embedded />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
