import { SITE_LINKEDIN, SITE_ROLE } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-lagoon)]">
          San Jose, CA
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-meg-display)] text-4xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-6xl">
          Hi, I&apos;m Omega
        </h1>
        <p className="mt-4 text-base font-medium text-[var(--meg-ink)] sm:text-lg">
          {SITE_ROLE}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
          I lead enterprise implementations end to end — discovery, data
          integration, and launch — and I build with AI on the side to stay
          sharp.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#meg"
            className="rounded-full bg-[var(--meg-lagoon)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--meg-lagoon-deep)]"
          >
            Talk to Meg
          </a>
          <a
            href={SITE_LINKEDIN}
            target="_blank"
            rel="noreferrer"
            className="meg-glass rounded-full px-5 py-2.5 text-sm font-medium text-[var(--meg-ink-soft)] transition hover:text-[var(--meg-ink)]"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
