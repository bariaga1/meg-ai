import { SITE_EMAIL, SITE_LINKEDIN } from "@/lib/site";
import { SITE_EXPERIENCE } from "@/lib/siteContent";

export function Experience() {
  return (
    <section id="resume" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-[var(--site-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-ink-soft)]">
              Experience
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-5xl">
              Omega Bariagaber
            </h2>
            <p className="mt-2 text-[15px] text-[var(--meg-ink-soft)]">
              Technical Implementation Leader · Applied AI &amp; Data Integration
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[var(--meg-ink)]">
            <a href={`mailto:${SITE_EMAIL}`} className="hover:opacity-60">
              {SITE_EMAIL}
            </a>
            <a
              href={SITE_LINKEDIN}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-60"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-8 space-y-10">
          {SITE_EXPERIENCE.map((role) => (
            <article
              key={role.company + role.dates}
              className="grid gap-3 border-b border-[var(--site-line)] pb-10 last:border-b-0 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-8"
            >
              <p className="text-[13px] font-medium text-[var(--meg-ink-soft)] sm:pt-1">
                {role.dates}
              </p>
              <div>
                <h3 className="text-[17px] font-semibold text-[var(--meg-ink)]">
                  {role.company}
                </h3>
                <p className="mt-1 text-[15px] text-[var(--meg-ink-soft)]">
                  {role.title} · {role.location}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
                  {role.summary}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet.lead}
                      className="flex gap-2.5 text-[15px] leading-relaxed text-[var(--meg-ink-soft)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--meg-lagoon)]" aria-hidden />
                      <span>
                        <strong className="font-semibold text-[var(--meg-ink)]">
                          {bullet.lead}
                        </strong>{" "}
                        {bullet.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
