import { SITE_LINKEDIN, SITE_RESUME_PDF, SITE_ROLE } from "@/lib/site";

type HeroProps = {
  onOpenMeg: () => void;
};

export function Hero({ onOpenMeg }: HeroProps) {
  return (
    <section id="top" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-meg-display)] text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-[var(--meg-ink)] sm:text-6xl">
            Hi, I&apos;m Omega
          </h1>
          <p className="mt-5 text-[17px] font-medium leading-snug text-[var(--meg-ink)] sm:text-xl">
            {SITE_ROLE}
          </p>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--meg-ink-soft)]">
            I lead enterprise implementations end to end — discovery, data
            integration, and launch — for Fortune 100 clients. On the side I
            build with AI to stay sharp on newer stacks.
          </p>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--meg-ink-soft)]">
            Ask Meg about the work, or scroll for the projects.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenMeg}
              className="rounded-full bg-[var(--meg-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--site-paper)] transition hover:bg-[var(--meg-lagoon-deep)]"
            >
              Talk to Meg
            </button>
            <a
              href={SITE_LINKEDIN}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--site-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--meg-ink)] transition hover:border-[var(--meg-ink)]"
            >
              LinkedIn
            </a>
            <a
              href={SITE_RESUME_PDF}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--site-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--meg-ink)] transition hover:border-[var(--meg-ink)]"
            >
              Resume PDF ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
