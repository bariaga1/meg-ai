"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A "Spartan" sticker that pops up Sparty with a "Go Green!" bubble on hover,
 * or on tap for touch screens, which have no hover.
 */
export function SpartanSticker() {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={`sticker sticker--spartan ${open ? "is-open" : ""}`}
      aria-label="Michigan State Spartan. Go Green!"
      onClick={() => setOpen((v) => !v)}
      onBlur={() => setOpen(false)}
    >
      <span className="sticker__dot" aria-hidden />
      MSU Spartan
      <span className="spartan-pop" aria-hidden>
        <span className="spartan-pop__bubble">Go Green!</span>
        <Image src="/images/spartan.png" width={267} height={480} alt="" className="spartan-pop__img" />
      </span>
    </button>
  );
}
