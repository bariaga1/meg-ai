import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Hero } from "@/components/site/Hero";
import { MegHighlight } from "@/components/site/MegHighlight";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { SiteNav } from "@/components/site/SiteNav";

export default function Home() {
  return (
    <div className="meg-atmosphere site-shell min-h-[100dvh]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="meg-blob-layer absolute inset-0">
          <div className="meg-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(110,168,186,0.34)] blur-3xl" />
        </div>
        <div className="meg-blob-b absolute -right-16 top-28">
          <div className="meg-blob h-80 w-80 rounded-full bg-[rgba(36,118,132,0.22)] blur-3xl [animation-delay:-6s]" />
        </div>
        <div className="meg-blob-c absolute bottom-0 left-1/3">
          <div className="meg-blob h-64 w-64 rounded-full bg-[rgba(180,96,72,0.12)] blur-3xl [animation-delay:-11s]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_55%)]" />
      </div>

      <div className="relative z-10">
        <SiteNav />
        <Hero />
        <MegHighlight />
        <ProjectGrid />
        <About />
        <Contact />
      </div>
    </div>
  );
}
