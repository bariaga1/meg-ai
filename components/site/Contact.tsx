import { SITE_EMAIL, SITE_LINKEDIN } from "@/lib/site";

export function Contact() {
  return (
    <section id="contact" className="site-section scroll-mt-20 pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-lagoon)]">
          Contact
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-4xl">
          Let&apos;s talk
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
          Recruiters and collaborators can reach me directly, or ask Meg first
          if you want the resume version.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="rounded-full bg-[var(--meg-lagoon)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--meg-lagoon-deep)]"
          >
            {SITE_EMAIL}
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
        <p className="mt-6 text-xs text-[var(--meg-ink-soft)]">
          Resume PDF will appear here when added to the site.
        </p>
      </div>
    </section>
  );
}
