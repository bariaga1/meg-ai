"use client";

import { useEffect, useRef, useState } from "react";

export type MegMood = "idle" | "thinking" | "speaking";

type Props = {
  mood?: MegMood;
  className?: string;
  /** Eyes follow the pointer and glance around when it rests. Off for tiny badges. */
  trackPointer?: boolean;
};

type Vec = { x: number; y: number };

/** How far (in SVG units) the face slides toward the pointer. */
const FACE_TRAVEL = { x: 6, y: 4.5 };
/** Pupil highlights move a little further than the face for depth. */
const SHINE_TRAVEL = { x: 1.6, y: 1.4 };
const FACE_LERP = 0.09;
/** No pointer movement for this long and Meg starts looking around. */
const GLANCE_AFTER_MS = 2600;
/** Where Meg looks while thinking: up and to the right. */
const THINK_LOOK: Vec = { x: 0.55, y: -0.85 };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Meg: a 70s sun sticker. Rays turn slowly, the body bobs with a little
 * squash, the eyes blink on an irregular rhythm, follow the pointer, and
 * wander when it rests. Hover for a happy squint, poke for a wink and a
 * bounce. Mood swaps the mouth and the motion: thinking looks up with
 * bouncing dots, speaking moves the mouth.
 */
export function MegCharacter({ mood = "idle", className = "", trackPointer = true }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const shineRefs = useRef<SVGCircleElement[]>([]);
  const moodRef = useRef(mood);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [poked, setPoked] = useState(false);

  moodRef.current = mood;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Irregular blinks, sometimes doubled, like a person.
  useEffect(() => {
    if (reducedMotion) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlinking(true);
        window.setTimeout(() => setBlinking(false), 130);
        if (Math.random() < 0.22) {
          window.setTimeout(() => setBlinking(true), 260);
          window.setTimeout(() => setBlinking(false), 390);
        }
        schedule();
      }, rand(2200, 5600));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // Face follows the pointer; when it rests, Meg glances around on her own.
  useEffect(() => {
    const face = faceRef.current;
    if (reducedMotion || !trackPointer) {
      if (face) face.style.transform = "";
      shineRefs.current.forEach((el) => el && (el.style.transform = ""));
      return;
    }

    const target: Vec = { x: 0, y: 0 };
    const pos: Vec = { x: 0, y: 0 };
    let lastPointer = 0;
    let nextGlance = 0;
    let visible = true;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      target.x = Math.max(-1, Math.min(1, (e.clientX - cx) / 360));
      target.y = Math.max(-1, Math.min(1, (e.clientY - cy) / 300));
      lastPointer = performance.now();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      let goal = target;
      if (moodRef.current === "thinking") {
        goal = THINK_LOOK;
      } else if (now - lastPointer > GLANCE_AFTER_MS && now > nextGlance) {
        target.x = rand(-0.9, 0.9);
        target.y = rand(-0.6, 0.7);
        nextGlance = now + rand(1400, 3400);
      }

      pos.x = lerp(pos.x, goal.x, FACE_LERP);
      pos.y = lerp(pos.y, goal.y, FACE_LERP);

      if (face) {
        face.style.transform = `translate(${(pos.x * FACE_TRAVEL.x).toFixed(2)}px, ${(pos.y * FACE_TRAVEL.y).toFixed(2)}px)`;
      }
      for (const el of shineRefs.current) {
        if (el) {
          el.style.transform = `translate(${(pos.x * SHINE_TRAVEL.x).toFixed(2)}px, ${(pos.y * SHINE_TRAVEL.y).toFixed(2)}px)`;
        }
      }
    };

    // Skip the per-frame work while Meg is scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    if (rootRef.current) io.observe(rootRef.current);

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reducedMotion, trackPointer]);

  const poke = () => {
    if (reducedMotion || poked) return;
    setPoked(true);
    window.setTimeout(() => setPoked(false), 700);
  };

  const classes = [
    "meg",
    `meg--${mood}`,
    blinking ? "is-blinking" : "",
    poked ? "is-poked" : "",
    reducedMotion ? "is-still" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={classes}
      role="img"
      aria-label="Meg, Omega's resume guide"
      onPointerDown={poke}
    >
      <svg viewBox="0 0 120 120" className="meg__svg" aria-hidden>
        {/* Sunburst: one dashed ring reads as rays and turns cheaply. */}
        <g className="meg__rays">
          <circle cx="60" cy="60" r="52" className="meg__rays-outer" />
          <circle cx="60" cy="60" r="52" className="meg__rays-inner" />
        </g>

        <g className="meg__bob">
          <g className="meg__squash">
            <circle cx="64" cy="64" r="37" className="meg__shadow" />
            <circle cx="60" cy="60" r="37" className="meg__body" />
            <path d="M 34 72 A 37 37 0 0 0 86 72" className="meg__body-shade" />
            <path d="M 37 48 A 26 26 0 0 1 56 32" className="meg__body-shine" />

            <g ref={faceRef} className="meg__face">
              <ellipse cx="41" cy="68" rx="6" ry="3.6" className="meg__cheek" />
              <ellipse cx="79" cy="68" rx="6" ry="3.6" className="meg__cheek" />

              <g className="meg__eye meg__eye--left">
                <g className="meg__eye-open">
                  <ellipse cx="48" cy="56" rx="5" ry="7.5" className="meg__eye-ball" />
                  <circle
                    ref={(el) => {
                      if (el) shineRefs.current[0] = el;
                    }}
                    cx="49.6"
                    cy="52.6"
                    r="2"
                    className="meg__eye-shine"
                  />
                </g>
                <path d="M 42.5 57 Q 48 50.5 53.5 57" className="meg__eye-happy" />
              </g>
              <g className="meg__eye meg__eye--right">
                <g className="meg__eye-open">
                  <ellipse cx="72" cy="56" rx="5" ry="7.5" className="meg__eye-ball" />
                  <circle
                    ref={(el) => {
                      if (el) shineRefs.current[1] = el;
                    }}
                    cx="73.6"
                    cy="52.6"
                    r="2"
                    className="meg__eye-shine"
                  />
                </g>
                <path d="M 66.5 57 Q 72 50.5 77.5 57" className="meg__eye-happy" />
              </g>

              <path d="M 50 70 Q 60 79 70 70" className="meg__mouth meg__mouth--smile" />
              <path d="M 47 69 Q 60 84 73 69" className="meg__mouth meg__mouth--grin" />
              <g className="meg__mouth meg__mouth--talk">
                <ellipse cx="60" cy="73" rx="7" ry="5.5" className="meg__mouth-hole" />
                <ellipse cx="60" cy="76" rx="4" ry="2" className="meg__tongue" />
              </g>
              <path d="M 54 73 Q 57 71 60 73 T 66 73" className="meg__mouth meg__mouth--hmm" />
            </g>
          </g>
        </g>

        <g className="meg__dots">
          <circle cx="92" cy="22" r="3.4" />
          <circle cx="101" cy="16" r="3.4" />
          <circle cx="110" cy="10" r="3.4" />
        </g>

        <g className="meg__sparks">
          <path d="M 18 30 l 3 -8 l 3 8 l 8 3 l -8 3 l -3 8 l -3 -8 l -8 -3 z" />
          <path d="M 96 92 l 2 -5 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 z" />
        </g>
      </svg>
    </div>
  );
}
