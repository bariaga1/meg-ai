"use client";

import { MegChat } from "@/components/chat/MegChat";
import { MegCharacter } from "@/components/chat/MegCharacter";
import type { MegChatState } from "@/components/chat/useMegChat";

type MegPanelProps = {
  open: boolean;
  /** Corner launcher shows only when the hero Meg has scrolled away. */
  showLauncher: boolean;
  chat: MegChatState;
  onOpen: () => void;
  onClose: () => void;
};

export function MegPanel({ open, showLauncher, chat, onOpen, onClose }: MegPanelProps) {
  const launcherVisible = showLauncher && !open;

  return (
    <>
      {/* Always mounted so it can animate in and out instead of popping. */}
      <button
        type="button"
        className={`site-meg-fab ${launcherVisible ? "is-visible" : ""}`}
        onClick={onOpen}
        aria-label={chat.mood === "idle" ? "Open Meg" : "Open Meg (replying)"}
        aria-hidden={!launcherVisible}
        tabIndex={launcherVisible ? 0 : -1}
      >
        <span className="site-meg-fab__pulse" aria-hidden />
        <MegCharacter mood={chat.mood} trackPointer={false} className="meg--fab" />
      </button>

      {open ? (
        <div className="site-meg-overlay" role="dialog" aria-modal="true" aria-label="Chat with Meg">
          <button
            type="button"
            className="site-meg-overlay__backdrop"
            aria-label="Close Meg"
            onClick={onClose}
          />
          <div className="site-meg-overlay__shell">
            <div className="site-meg-overlay__mascot" aria-hidden>
              <MegCharacter mood={chat.mood} className="meg--panel" />
            </div>
            <div className="site-meg-overlay__panel">
              <div className="retro-stripes h-2 shrink-0" aria-hidden />
              <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[var(--ink)] px-4 py-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--orange)]">
                    Omega&apos;s resume guide
                  </p>
                  <p className="display text-2xl text-[var(--ink)]">Meg</p>
                </div>
                <button type="button" onClick={onClose} className="retro-btn px-3.5 py-1.5">
                  Minimize
                </button>
              </div>
              <div className="site-meg-overlay__chat">
                <MegChat chat={chat} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
