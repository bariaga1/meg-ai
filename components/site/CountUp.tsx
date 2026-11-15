"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;

/** Splits "$5M+" into "$", 5, "M+" so only the number animates. */
function parse(value: string): { prefix: string; target: number; suffix: string } | null {
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], target: Number(match[2]), suffix: match[3] };
}

/**
 * Counts a metric up from zero the first time it scrolls into view.
 * Renders the final value on the server, for screen readers, and when the
 * viewer prefers reduced motion, so the real number is never hidden.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parts = parse(value);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parts) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load: leave the final number rather than flash to 0.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(eased * parts.target));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // parts is derived from value; re-run only when the value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const text = parts && shown !== null ? `${parts.prefix}${shown}${parts.suffix}` : value;
  return (
    <span ref={ref} aria-label={value} className="tabular-nums">
      <span aria-hidden>{text}</span>
    </span>
  );
}
