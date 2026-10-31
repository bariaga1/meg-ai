"use client";

import { useEffect, useRef, useState } from "react";

export type MegMood = "idle" | "thinking" | "speaking";

type Props = {
  powered: boolean;
  mood?: MegMood;
  className?: string;
};

type Vec = { x: number; y: number };

const MAX_TILT = 14;
const LERP = 0.12;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function MegCharacter({ powered, mood = "idle", className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Vec>({ x: 0, y: 0 });
  const currentRef = useRef<Vec>({ x: 0, y: 0 });
  const [tilt, setTilt] = useState<Vec>({ x: 0, y: 0 });
  const [eyeShift, setEyeShift] = useState<Vec>({ x: 0, y: 0 });
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
      return;
    }

    const onPointer = (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / 280));
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / 220));
      targetRef.current = { x: ny * MAX_TILT, y: nx * MAX_TILT };
    };

    const onMove = (e: PointerEvent) => onPointer(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [powered, reducedMotion]);

  useEffect(() => {
    if (!powered || reducedMotion) {
      currentRef.current = { x: 0, y: 0 };
      setTilt({ x: 0, y: 0 });
      setEyeShift({ x: 0, y: 0 });
      return;
    }

    let raf = 0;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x = lerp(cur.x, tgt.x, LERP);
      cur.y = lerp(cur.y, tgt.y, LERP);
      setTilt({ x: cur.x, y: cur.y });
      setEyeShift({
        x: (cur.y / MAX_TILT) * 3.5,
        y: (cur.x / MAX_TILT) * 2.5,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
        <div
          className="meg-character__tilt"
          style={
            reducedMotion
              ? undefined
              : {
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }
          }
        >
          <div className="meg-character__glow" aria-hidden />
          <div className="meg-character__face">
            <div
              className="meg-character__eyes"
              style={
                reducedMotion
                  ? undefined
                  : { transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)` }
              }
            >
              <span className="meg-character__eye meg-character__eye--left" />
              <span className="meg-character__eye meg-character__eye--right" />
            </div>
            <div className="meg-character__mouth" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
