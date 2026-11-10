"use client";

import { MegChat } from "@/components/chat/MegChat";
import { MegCharacter } from "@/components/chat/MegCharacter";

export type MegUiState = "closed" | "open" | "minimized";

type MegPanelProps = {
  state: MegUiState;
  onOpen: () => void;
  onMinimize: () => void;
};

export function MegPanel({ state, onOpen, onMinimize }: MegPanelProps) {
  if (state === "minimized") {
    return (
      <button
        type="button"
        className="site-meg-fab"
        onClick={onOpen}
        aria-label="Open Meg"
      >
        <span className="site-meg-fab__orb" aria-hidden>
          <MegCharacter
            powered
            mood="idle"
            trackPointer={false}
            className="meg-character--fab"
          />
        </span>
        <span className="site-meg-fab__pulse" aria-hidden />
      </button>
    );
  }

  if (state !== "open") return null;

  return (
    <div className="site-meg-overlay" role="dialog" aria-modal="true" aria-label="Chat with Meg">
      <button
        type="button"
        className="site-meg-overlay__backdrop"
        aria-label="Minimize Meg"
        onClick={onMinimize}
      />
      <div className="site-meg-overlay__panel">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--site-line)] px-4 py-3">
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
            onClick={onMinimize}
            className="rounded-full border border-[var(--site-line)] px-3.5 py-1.5 text-sm font-semibold text-[var(--meg-ink)] transition hover:border-[var(--meg-ink)]"
          >
            Minimize
          </button>
        </div>
        <div className="site-meg-overlay__chat">
          <MegChat embedded />
        </div>
      </div>
    </div>
  );
}
