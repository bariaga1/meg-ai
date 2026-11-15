"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/site/CountUp";
import { SITE_HIGHLIGHTS } from "@/lib/siteContent";

/** Box colours in order; the first box is the large feature. */
const TONES = ["tone-orange", "tone-teal", "tone-mustard", "tone-card", "tone-teal", "tone-mustard"];

const STEPS = [
  { key: "challenge", label: "The challenge" },
  { key: "action", label: "What he did" },
  { key: "result", label: "The result" },
] as const;

/**
 * Career highlight boxes. Each opens in place to tell the full story; on
 * wider screens the open box takes a whole row. One box is open at a time.
 */
export function Highlights({ onAskMeg }: { onAskMeg: (question: string) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);

  // Esc closes the open box and puts focus back on its toggle.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      toggleRefs.current[openIndex]?.focus();
      setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  // The open box can move when the grid reflows; keep it in view.
  useEffect(() => {
    if (openIndex === null) return;
    const tile = tileRefs.current[openIndex];
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    if (rect.top >= 72 && rect.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tile.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }, [openIndex]);

  return (
    <section id="highlights" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <p className="retro-eyebrow">Career highlights</p>
        <p className="mt-2 text-[14px] font-semibold text-[var(--ink-soft)]">
          Tap any box for the story behind the number.
        </p>
        <div className="highlight-grid mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SITE_HIGHLIGHTS.map((item, i) => {
            const feature = i === 0;
            const open = openIndex === i;
            const detailId = `highlight-detail-${i}`;
            return (
              <article
                key={item.metric + item.unit}
                ref={(el) => {
                  tileRefs.current[i] = el;
                }}
                className={`metric-tile retro-card flex flex-col ${TONES[i % TONES.length]} ${
                  feature ? "metric-tile--feature p-7 md:col-span-2" : "p-5"
                } ${feature && !open ? "lg:row-span-2" : ""} ${
                  open ? "is-open md:col-span-2 lg:col-span-3" : "retro-lift"
                }`}
              >
                <button
                  type="button"
                  ref={(el) => {
                    toggleRefs.current[i] = el;
                  }}
                  className="metric-tile__toggle flex flex-1 flex-col text-left"
                  aria-expanded={open}
                  aria-controls={detailId}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="flex w-full items-start justify-between gap-3">
                    <span className="metric-tile__source">{item.source}</span>
                    <span className="metric-tile__more" aria-hidden>
                      {open ? "Close ×" : "Story +"}
                    </span>
                  </span>
                  <span
                    className={`display mt-4 block leading-none ${
                      feature ? "text-7xl sm:text-8xl lg:text-[8.5rem]" : "text-5xl"
                    }`}
                  >
                    <CountUp value={item.metric} />
                  </span>
                  <span
                    className={`mt-2 block font-extrabold leading-snug ${
                      feature ? "text-xl sm:text-2xl" : "text-[15px]"
                    }`}
                  >
                    {item.unit}
                  </span>
                  {!open ? (
                    <span
                      className={`mt-3 block leading-relaxed opacity-90 ${
                        feature ? "max-w-md text-[16px] sm:text-[17px]" : "text-[14px]"
                      }`}
                    >
                      {item.story}
                    </span>
                  ) : null}
                </button>

                {feature && item.extras?.length && !open ? (
                  <dl className="metric-tile__extras mt-6 grid grid-cols-2 gap-5 pt-5 lg:mt-auto">
                    {item.extras.map((extra) => (
                      <div key={extra.unit}>
                        <dt className="sr-only">{extra.unit}</dt>
                        <dd className="display text-4xl leading-none sm:text-5xl">
                          <CountUp value={extra.metric} />
                        </dd>
                        <dd className="mt-2 text-[14px] font-bold leading-snug opacity-90">
                          {extra.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <div id={detailId} hidden={!open} className="metric-tile__detail">
                  {open ? (
                    <>
                      <ol className="mt-5 grid gap-5 pt-5 md:grid-cols-3">
                        {STEPS.map((step) => (
                          <li key={step.key}>
                            <p className="metric-tile__step">{step.label}</p>
                            <p className="mt-1.5 text-[15px] leading-relaxed">
                              {item.detail[step.key]}
                            </p>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <ul className="flex flex-wrap gap-2" aria-label="Skills">
                          {item.detail.tags.map((tag) => (
                            <li key={tag} className="metric-tile__tag">
                              {tag}
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="metric-tile__ask"
                          onClick={() => onAskMeg(item.detail.ask)}
                        >
                          Ask Meg: “{item.detail.ask}” →
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
