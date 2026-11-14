"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMegChat } from "@/components/chat/useMegChat";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Experience } from "@/components/site/Experience";
import { Hero } from "@/components/site/Hero";
import { Highlights } from "@/components/site/Highlights";
import { Marquee } from "@/components/site/Marquee";
import { MegHighlight } from "@/components/site/MegHighlight";
import { MegPanel } from "@/components/site/MegPanel";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { SiteNav } from "@/components/site/SiteNav";

/**
 * Page background per section, keyed by section id. All are pale warm
 * paper tones a few steps apart, so the shift is felt more than seen.
 */
const SECTION_TONES: Record<string, string> = {
  top: "#f4ead6", // cream
  about: "#f6e4d0", // peach
  highlights: "#f3e7c6", // butter
  resume: "#ede7d5", // oat
  meg: "#e7e9d8", // sage, next to the teal card
  work: "#f5e2d5", // blush
  contact: "#f4ead6", // back to cream
};

/** Fades the page background to the tone of whichever section crosses mid-screen. */
function useScrollTone(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const style = document.documentElement.style;
    // A thin band across the middle of the viewport decides the current section.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const tone = SECTION_TONES[entry.target.id];
          if (entry.isIntersecting && tone) style.setProperty("--bg", tone);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll("section[id]").forEach((section) => io.observe(section));
    return () => {
      io.disconnect();
      style.removeProperty("--bg");
    };
  }, [root]);
}

/** True while the big hero Meg is on screen. Starts true so nothing flashes on load. */
function useInView(target: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), {
      // Count her as gone once most of her has scrolled under the sticky nav.
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return inView;
}

export function SiteShell() {
  const [megOpen, setMegOpen] = useState(false);
  // Owned here, not in the panel, so closing Meg keeps the conversation.
  const chat = useMegChat();
  const shellRef = useRef<HTMLDivElement>(null);
  const heroMegRef = useRef<HTMLDivElement>(null);
  const heroMegVisible = useInView(heroMegRef);

  useScrollTone(shellRef);

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
    <div ref={shellRef} className="site-shell min-h-[100dvh]">
      <SiteNav onOpenMeg={openMeg} />
      <Hero onOpenMeg={openMeg} megMood={chat.mood} megRef={heroMegRef} />
      <Marquee />
      <About />
      <Highlights />
      <Experience />
      <MegHighlight onOpen={openMeg} megMood={chat.mood} />
      <ProjectGrid />
      <Contact onOpenMeg={openMeg} />
      <MegPanel
        open={megOpen}
        // One Meg on screen at a time: the corner Meg takes over once the hero Meg is gone.
        showLauncher={!heroMegVisible}
        chat={chat}
        onOpen={openMeg}
        onClose={closeMeg}
      />
    </div>
  );
}
