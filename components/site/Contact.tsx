import { SITE_EMAIL, SITE_LINKEDIN, SITE_RESUME_PDF } from "@/lib/site";

type ContactProps = {
  onOpenMeg?: () => void;
};

export function Contact({ onOpenMeg }: ContactProps) {
  return (
    <section id="contact" className="site-section scroll-mt-20 pb-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-ink)]">
            Contact
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-5xl">
            Let&apos;s talk
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--meg-ink-soft)]">
            Recruiters and collaborators can reach me directly, or open Meg if
            you want the resume version first.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="rounded-full bg-[var(--meg-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--site-paper)] transition hover:bg-[var(--meg-lagoon-deep)]"
            >
              {SITE_EMAIL}
            </a>
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
              Download PDF ↓
            </a>
            {onOpenMeg ? (
              <button
                type="button"
                onClick={onOpenMeg}
                className="rounded-full border border-[var(--site-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--meg-ink)] transition hover:border-[var(--meg-ink)]"
              >
                Open Meg
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
