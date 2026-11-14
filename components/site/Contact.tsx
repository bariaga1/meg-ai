import { SITE_EMAIL, SITE_LINKEDIN, SITE_RESUME_PDF } from "@/lib/site";

type ContactProps = {
  onOpenMeg?: () => void;
};

export function Contact({ onOpenMeg }: ContactProps) {
  return (
    <>
      <section id="contact" className="site-section scroll-mt-20 pb-24">
        <div className="reveal mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <p className="retro-eyebrow">Contact</p>
            <h2 className="display mt-3 text-5xl text-[var(--ink)] sm:text-7xl">
              Get in touch<span className="text-[var(--orange)]">.</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)]">
              Recruiters and collaborators can reach me directly, or open Meg if
              you want the resume version first.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={`mailto:${SITE_EMAIL}`} className="retro-btn retro-btn--primary">
                {SITE_EMAIL}
              </a>
              <a href={SITE_LINKEDIN} target="_blank" rel="noreferrer" className="retro-btn">
                LinkedIn
              </a>
              <a href={SITE_RESUME_PDF} target="_blank" rel="noreferrer" className="retro-btn">
                Download PDF ↓
              </a>
              {onOpenMeg ? (
                <button type="button" onClick={onOpenMeg} className="retro-btn retro-btn--teal">
                  Open Meg
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <footer aria-label="Footer">
        <div className="retro-stripes h-3" aria-hidden />
        <div className="bg-[var(--ink)] px-5 py-6 text-center text-[13px] font-semibold text-[var(--cream)]">
          Omega Bariagaber · made with Meg
        </div>
      </footer>
    </>
  );
}
