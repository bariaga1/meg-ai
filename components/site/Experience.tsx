import { SITE_EMAIL, SITE_LINKEDIN, SITE_RESUME_PDF } from "@/lib/site";
import { SITE_EXPERIENCE } from "@/lib/siteContent";

export function Experience() {
  return (
    <section id="resume" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="reveal flex flex-col gap-5 border-b-2 border-[var(--ink)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="retro-eyebrow">Experience</p>
            <h2 className="display mt-3 text-4xl text-[var(--ink)] sm:text-6xl">
              Omega Bariagaber
            </h2>
            <p className="mt-2 text-[15px] font-semibold text-[var(--ink-soft)]">
              Technical Implementation Leader · Applied AI &amp; Data Integration
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold text-[var(--ink)]">
            <a href={`mailto:${SITE_EMAIL}`} className="site-nav__link">
              {SITE_EMAIL}
            </a>
            <a href={SITE_LINKEDIN} target="_blank" rel="noreferrer" className="site-nav__link">
              LinkedIn
            </a>
            <a href={SITE_RESUME_PDF} target="_blank" rel="noreferrer" className="site-nav__link">
              Download PDF ↓
            </a>
          </div>
        </div>

        <div className="timeline mt-10 space-y-12">
          {SITE_EXPERIENCE.map((role) => (
            <article
              key={role.company + role.dates}
              className="timeline__item reveal grid gap-3 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-16"
            >
              <p className="self-start justify-self-start rounded-full border-2 border-[var(--ink)] bg-[var(--mustard-soft)] px-3 py-1 text-[12px] font-extrabold leading-snug text-[var(--ink)]">
                {role.dates}
              </p>
              <div>
                <h3 className="display text-2xl text-[var(--ink)]">{role.company}</h3>
                <p className="mt-1 text-[15px] font-semibold text-[var(--orange)]">
                  {role.title} · {role.location}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  {role.summary}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet.lead}
                      className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink-soft)]"
                    >
                      <span className="diamond" aria-hidden />
                      <span>
                        <strong className="font-extrabold text-[var(--ink)]">{bullet.lead}</strong>{" "}
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
