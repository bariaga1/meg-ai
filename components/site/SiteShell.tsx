"use client";

import { useCallback, useEffect, useState } from "react";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Experience } from "@/components/site/Experience";
import { Hero } from "@/components/site/Hero";
import { Highlights } from "@/components/site/Highlights";
import { MegHighlight } from "@/components/site/MegHighlight";
import { MegPanel, type MegUiState } from "@/components/site/MegPanel";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { SiteNav } from "@/components/site/SiteNav";

export function SiteShell() {
  const [megState, setMegState] = useState<MegUiState>("closed");

  const openMeg = useCallback(() => setMegState("open"), []);
  const minimizeMeg = useCallback(() => setMegState("minimized"), []);

  useEffect(() => {
    if (megState !== "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") minimizeMeg();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [megState, minimizeMeg]);

  return (
    <div className="site-shell min-h-[100dvh]">
      <SiteNav onOpenMeg={openMeg} />
      <Hero onOpenMeg={openMeg} />
      <About />
      <Highlights />
      <Experience />
      <MegHighlight onOpen={openMeg} />
      <ProjectGrid />
      <Contact onOpenMeg={openMeg} />
      <MegPanel state={megState} onOpen={openMeg} onMinimize={minimizeMeg} />
    </div>
  );
}
