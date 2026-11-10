"use client";

import { useCallback, useEffect, useState } from "react";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Hero } from "@/components/site/Hero";
import { MegHighlight } from "@/components/site/MegHighlight";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { SiteNav } from "@/components/site/SiteNav";

export function SiteShell() {
  const [megOpen, setMegOpen] = useState(false);

  const openMeg = useCallback(() => setMegOpen(true), []);
  const closeMeg = useCallback(() => setMegOpen(false), []);

  useEffect(() => {
    if (!megOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMeg();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [megOpen, closeMeg]);

  return (
    <div className="site-shell min-h-[100dvh]">
      <SiteNav onOpenMeg={openMeg} />
      <Hero onOpenMeg={openMeg} />
      <MegHighlight open={megOpen} onOpen={openMeg} onClose={closeMeg} />
      <ProjectGrid />
      <About />
      <Contact onOpenMeg={openMeg} />
    </div>
  );
}
