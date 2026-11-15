import { CountUp } from "@/components/site/CountUp";
import { SITE_HIGHLIGHTS } from "@/lib/siteContent";

/** Box colours in order; the first box is the large feature. */
const TONES = ["tone-orange", "tone-teal", "tone-mustard", "tone-card", "tone-teal", "tone-mustard"];

export function Highlights() {
  return (
    <section id="highlights" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <p className="retro-eyebrow">Career highlights</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SITE_HIGHLIGHTS.map((item, i) => {
            const feature = i === 0;
            return (
              <article
                key={item.metric + item.unit}
                className={`metric-tile retro-card retro-lift flex flex-col p-5 ${TONES[i % TONES.length]} ${
                  feature ? "metric-tile--feature p-7 md:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <p className="metric-tile__source">{item.source}</p>
                <p
                  className={`display mt-4 leading-none ${
                    feature ? "text-7xl sm:text-8xl lg:text-[8.5rem]" : "text-5xl"
                  }`}
                >
                  <CountUp value={item.metric} />
                </p>
                <p
                  className={`mt-2 font-extrabold leading-snug ${
                    feature ? "text-xl sm:text-2xl" : "text-[15px]"
                  }`}
                >
                  {item.unit}
                </p>
                <p
                  className={`mt-3 leading-relaxed opacity-90 ${
                    feature ? "max-w-md text-[16px] sm:text-[17px]" : "text-[14px]"
                  }`}
                >
                  {item.story}
                </p>
                {feature && item.extras?.length ? (
                  <dl className="metric-tile__extras mt-6 grid grid-cols-2 gap-5 pt-5 lg:mt-auto">
                    {item.extras.map((extra) => (
                      <div key={extra.unit}>
                        <dt className="sr-only">{extra.unit}</dt>
                        <dd className="display text-4xl leading-none sm:text-5xl">
                          <CountUp value={extra.metric} />
                        </dd>
                        <dd className="mt-2 text-[14px] font-bold leading-snug opacity-90">
                          {extra.unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
