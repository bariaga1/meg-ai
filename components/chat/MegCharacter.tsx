"use client";

import { useEffect, useRef, useState } from "react";

export type MegMood = "idle" | "thinking" | "speaking";

type Props = {
  powered: boolean;
  mood?: MegMood;
  className?: string;
};

type Vec = { x: number; y: number };

/** Degrees of head pitch/yaw toward the pointer. */
const MAX_TILT = 26;
/** Head catch-up — lower = more lag (portfolio-like). */
const HEAD_LERP = 0.075;
/** Eyes chase a bit slower than the head. */
const EYE_LERP = 0.048;
const EYE_TRAVEL_X = 7.5;
const EYE_TRAVEL_Y = 5.5;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function MegCharacter({ powered, mood = "idle", className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Vec>({ x: 0, y: 0 });
  const headRef = useRef<Vec>({ x: 0, y: 0 });
  const eyesVecRef = useRef<Vec>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!powered || reducedMotion) {
      targetRef.current = { x: 0, y: 0 };
      headRef.current = { x: 0, y: 0 };
      eyesVecRef.current = { x: 0, y: 0 };
      if (tiltRef.current) {
        tiltRef.current.style.transform = "";
        tiltRef.current.style.removeProperty("--meg-spec-x");
        tiltRef.current.style.removeProperty("--meg-spec-y");
        tiltRef.current.style.removeProperty("--meg-shade-x");
        tiltRef.current.style.removeProperty("--meg-shade-y");
      }
      if (eyesRef.current) eyesRef.current.style.transform = "";
      return;
    }

    const onPointer = (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Soft falloff so far-away pointer still pulls, near pointer is snappy.
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / 320));
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / 260));
      targetRef.current = { x: ny * MAX_TILT, y: nx * MAX_TILT };
    };

    const onMove = (e: PointerEvent) => onPointer(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      const tgt = targetRef.current;
      const head = headRef.current;
      const eyes = eyesVecRef.current;

      head.x = lerp(head.x, tgt.x, HEAD_LERP);
      head.y = lerp(head.y, tgt.y, HEAD_LERP);

      // Eyes aim at the same target, but spring slower → lag behind the face.
      const eyeTargetX = (tgt.y / MAX_TILT) * EYE_TRAVEL_X;
      const eyeTargetY = (tgt.x / MAX_TILT) * EYE_TRAVEL_Y;
      eyes.x = lerp(eyes.x, eyeTargetX, EYE_LERP);
      eyes.y = lerp(eyes.y, eyeTargetY, EYE_LERP);

      const nx = head.y / MAX_TILT;
      const ny = head.x / MAX_TILT;
      const tiltEl = tiltRef.current;
      if (tiltEl) {
        tiltEl.style.transform = `rotateX(${head.x.toFixed(3)}deg) rotateY(${head.y.toFixed(3)}deg) translateZ(16px)`;
        tiltEl.style.setProperty("--meg-spec-x", `${42 + nx * 30}%`);
        tiltEl.style.setProperty("--meg-spec-y", `${28 + ny * 24}%`);
        tiltEl.style.setProperty("--meg-shade-x", `${50 - nx * 20}%`);
        tiltEl.style.setProperty("--meg-shade-y", `${62 - ny * 16}%`);
      }
      if (eyesRef.current) {
        eyesRef.current.style.transform = `translate3d(${eyes.x.toFixed(3)}px, ${eyes.y.toFixed(3)}px, 8px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [powered, reducedMotion]);

  const moodClass =
    mood === "thinking"
      ? "meg-character--thinking"
      : mood === "speaking"
        ? "meg-character--speaking"
        : reducedMotion
          ? ""
          : "meg-character--breathing";

  return (
    <div
      ref={rootRef}
      className={`meg-character meg-character--powering ${moodClass} ${className}`}
      role="img"
      aria-label="Meg, your resume guide"
    >
      <div className="meg-character__stage">
        <div ref={tiltRef} className="meg-character__tilt">
          <div className="meg-character__glow" aria-hidden />
          <div className="meg-character__orb">
            <div className="meg-character__face">
              <div className="meg-character__shade" aria-hidden />
              <div className="meg-character__specular" aria-hidden />
              <div className="meg-character__rim" aria-hidden />
              <div ref={eyesRef} className="meg-character__eyes">
                <span className="meg-character__eye meg-character__eye--left">
                  <span className="meg-character__pupil" />
                </span>
                <span className="meg-character__eye meg-character__eye--right">
                  <span className="meg-character__pupil" />
                </span>
              </div>
              <div className="meg-character__mouth" aria-hidden />
            </div>
          </div>
          <div className="meg-character__floor-shadow" aria-hidden />
        </div>
      </div>
    </div>
  );
}
