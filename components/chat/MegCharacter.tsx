"use client";

import { useEffect, useRef, useState } from "react";

export type MegMood = "idle" | "thinking" | "speaking";

type Props = {
  powered: boolean;
  mood?: MegMood;
  className?: string;
};

type Vec = { x: number; y: number };

/** How fast the gloss tracks the pointer. The silhouette never rotates. */
const LIGHT_LERP = 0.14;
/** Face slides inside the sphere, slower than the highlight. */
const FACE_LERP = 0.05;
const FACE_TRAVEL_X = 7;
const FACE_TRAVEL_Y = 5;
const PUPIL_EXTRA_X = 2.2;
const PUPIL_EXTRA_Y = 1.5;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function MegCharacter({ powered, mood = "idle", className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Vec>({ x: 0, y: 0 });
  const lightRef = useRef<Vec>({ x: 36, y: 28 });
  const faceVecRef = useRef<Vec>({ x: 0, y: 0 });
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
      lightRef.current = { x: 36, y: 28 };
      faceVecRef.current = { x: 0, y: 0 };
      if (tiltRef.current) {
        tiltRef.current.style.removeProperty("--meg-light-x");
        tiltRef.current.style.removeProperty("--meg-light-y");
        tiltRef.current.style.removeProperty("--meg-pupil-x");
        tiltRef.current.style.removeProperty("--meg-pupil-y");
        tiltRef.current.style.removeProperty("--meg-shadow-x");
      }
      if (faceRef.current) faceRef.current.style.transform = "";
      return;
    }

    const onPointer = (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / 320));
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / 260));
      targetRef.current = { x: nx, y: ny };
    };

    const onMove = (e: PointerEvent) => onPointer(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      const tgt = targetRef.current;
      const light = lightRef.current;
      const face = faceVecRef.current;

      const lightX = 36 + tgt.x * 14;
      const lightY = 28 + tgt.y * 10;
      light.x = lerp(light.x, lightX, LIGHT_LERP);
      light.y = lerp(light.y, lightY, LIGHT_LERP);

      face.x = lerp(face.x, tgt.x * FACE_TRAVEL_X, FACE_LERP);
      face.y = lerp(face.y, tgt.y * FACE_TRAVEL_Y, FACE_LERP);

      const nx = (light.x - 36) / 14;
      const faceNx = face.x / FACE_TRAVEL_X;
      const faceNy = face.y / FACE_TRAVEL_Y;
      const tiltEl = tiltRef.current;
      if (tiltEl) {
        tiltEl.style.setProperty("--meg-light-x", `${light.x.toFixed(2)}%`);
        tiltEl.style.setProperty("--meg-light-y", `${light.y.toFixed(2)}%`);
        tiltEl.style.setProperty("--meg-pupil-x", `${(faceNx * PUPIL_EXTRA_X).toFixed(2)}px`);
        tiltEl.style.setProperty("--meg-pupil-y", `${(faceNy * PUPIL_EXTRA_Y).toFixed(2)}px`);
        tiltEl.style.setProperty("--meg-shadow-x", `${(-nx * 6).toFixed(2)}px`);
      }
      if (faceRef.current) {
        faceRef.current.style.transform = `translate3d(${face.x.toFixed(2)}px, ${face.y.toFixed(2)}px, 0)`;
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
            <div className="meg-character__limb" aria-hidden />
            <div className="meg-character__specular" aria-hidden />
            <div ref={faceRef} className="meg-character__features">
              <div className="meg-character__eyes">
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
