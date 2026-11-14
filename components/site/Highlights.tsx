import { SITE_HIGHLIGHTS } from "@/lib/siteContent";

export function Highlights() {
  return (
    <section id="highlights" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <p className="retro-eyebrow">Career highlights</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SITE_HIGHLIGHTS.map((item) => (
            <article
              key={item.metric + item.label}
              className="metric-tile retro-card retro-lift p-5"
            >
              <p className="display text-4xl sm:text-5xl">{item.metric}</p>
              <p className="mt-2 text-[14px] font-semibold leading-snug opacity-90">
                {item.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
