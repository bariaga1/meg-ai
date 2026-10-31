"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

export type MegMood = "idle" | "thinking" | "speaking";

type Props = {
  powered: boolean;
  mood?: MegMood;
  className?: string;
};

type Vec = { x: number; y: number };

const MAX_TILT = 18;
const LERP = 0.14;

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
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / 260));
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / 200));
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
        x: (cur.y / MAX_TILT) * 4.2,
        y: (cur.x / MAX_TILT) * 3.2,
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

  const nx = tilt.y / MAX_TILT;
  const ny = tilt.x / MAX_TILT;
  const tiltStyle: CSSProperties | undefined = reducedMotion
    ? undefined
    : ({
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(12px)`,
        "--meg-spec-x": `${42 + nx * 28}%`,
        "--meg-spec-y": `${28 + ny * 22}%`,
        "--meg-shade-x": `${50 - nx * 18}%`,
        "--meg-shade-y": `${62 - ny * 14}%`,
      } as CSSProperties);

  return (
    <div
      ref={rootRef}
      className={`meg-character meg-character--powering ${moodClass} ${className}`}
      role="img"
      aria-label="Meg, your resume guide"
    >
      <div className="meg-character__stage">
        <div className="meg-character__tilt" style={tiltStyle}>
          <div className="meg-character__glow" aria-hidden />
          <div className="meg-character__orb">
            <div className="meg-character__face">
              <div className="meg-character__shade" aria-hidden />
              <div className="meg-character__specular" aria-hidden />
              <div className="meg-character__rim" aria-hidden />
              <div
                className="meg-character__eyes"
                style={
                  reducedMotion
                    ? undefined
                    : { transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)` }
                }
              >
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
