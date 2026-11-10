import { SITE_HIGHLIGHTS } from "@/lib/siteContent";

export function Highlights() {
  return (
    <section id="highlights" className="site-section scroll-mt-20 pt-2">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-ink-soft)]">
          Career highlights
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_HIGHLIGHTS.map((item) => (
            <article key={item.metric + item.label} className="site-metric rounded-[1.25rem] p-5">
              <p className="font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-lagoon-deep)] sm:text-4xl">
                {item.metric}
              </p>
              <p className="mt-2 text-[14px] leading-snug text-[var(--meg-ink-soft)]">
                {item.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
