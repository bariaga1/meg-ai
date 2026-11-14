"use client";

import { MegCharacter, type MegMood } from "@/components/chat/MegCharacter";

type MegHighlightProps = {
  onOpen: () => void;
  megMood: MegMood;
};

export function MegHighlight({ onOpen, megMood }: MegHighlightProps) {
  return (
    <section id="meg" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onOpen}
          className="site-meg-feature retro-lift group flex w-full flex-col gap-6 rounded-[1.75rem] px-6 py-7 text-left sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-9"
        >
          <div className="relative z-[1] flex min-w-0 items-start gap-5 sm:items-center">
            <span className="hidden sm:block">
              <MegCharacter mood={megMood} trackPointer={false} className="meg--badge" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--mustard)]">
                Always on · resume chat
              </p>
              <h2 className="display mt-2 text-3xl sm:text-5xl">Meet Meg</h2>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed opacity-90">
                Meg knows my resume and side projects inside out. Ask about a
                role, a skill, or any number you saw above. She answers from the
                real record and sends you to me for anything else.
              </p>
            </div>
          </div>
          <span className="retro-btn retro-btn--mustard relative z-[1] shrink-0 self-start sm:self-center">
            Start a chat →
          </span>
        </button>
      </div>
    </section>
  );
}
