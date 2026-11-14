"use client";

import type { RefObject } from "react";
import { MegCharacter, type MegMood } from "@/components/chat/MegCharacter";
import { SITE_LINKEDIN, SITE_RESUME_PDF, SITE_ROLE } from "@/lib/site";

type HeroProps = {
  onOpenMeg: () => void;
  megMood: MegMood;
  /** Lets the shell know when this big Meg scrolls out of view. */
  megRef?: RefObject<HTMLDivElement | null>;
};

/** Four concentric half-rings, outer to inner, that draw in on load. */
const ARCH_BANDS = [
  { r: 136, color: "var(--orange)" },
  { r: 110, color: "var(--orange-bright)" },
  { r: 84, color: "var(--mustard)" },
  { r: 58, color: "var(--teal)" },
];

export function Hero({ onOpenMeg, megMood, megRef }: HeroProps) {
  return (
    <section id="top" className="site-section scroll-mt-20 pb-14 pt-12 sm:pt-16">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <p className="retro-eyebrow">Portfolio · est. 2014</p>
          <h1 className="display mt-5 text-[3.1rem] leading-[0.98] text-[var(--ink)] sm:text-7xl">
            Hi, I&apos;m <span className="text-[var(--orange)]">Omega</span>
          </h1>
          <p className="mt-5 text-[17px] font-bold leading-snug text-[var(--ink)] sm:text-xl">
            {SITE_ROLE}
          </p>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
            I lead enterprise implementations end to end — discovery, data
            integration, and launch — for Fortune 100 clients. On the side I
            build with AI to stay sharp on newer stacks.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
            Ask Meg about the work, or scroll for the projects.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onOpenMeg} className="retro-btn retro-btn--primary">
              Talk to Meg
            </button>
            <a href={SITE_LINKEDIN} target="_blank" rel="noreferrer" className="retro-btn">
              LinkedIn
            </a>
            <a href={SITE_RESUME_PDF} target="_blank" rel="noreferrer" className="retro-btn">
              Resume PDF ↓
            </a>
          </div>
        </div>

        <div ref={megRef} className="hero-arch">
          <svg viewBox="0 0 300 276" className="hero-arch__svg" aria-hidden>
            {ARCH_BANDS.map((band) => (
              <path
                key={band.r}
                className="hero-arch__band"
                stroke={band.color}
                d={`M ${150 - band.r} 276 A ${band.r} ${band.r} 0 0 1 ${150 + band.r} 276`}
              />
            ))}
          </svg>
          <p className="hero-bubble" aria-hidden>
            Psst — I know Omega&apos;s whole resume. Ask me!
          </p>
          <button
            type="button"
            onClick={onOpenMeg}
            className="hero-arch__meg"
            aria-label="Open Meg, the resume chat"
          >
            <MegCharacter mood={megMood} className="meg--hero" />
          </button>
        </div>
      </div>
    </section>
  );
}
