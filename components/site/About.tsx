export function About() {
  return (
    <section id="about" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-ink)]">
            About
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-5xl">
            How I work
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[var(--meg-ink-soft)]">
            <p>
              I&apos;ve spent 10+ years in enterprise software delivery —
              turning business needs into data integrations and platform
              configurations for Fortune 100 clients, from discovery through
              launch.
            </p>
            <p>
              At Medallia I owned full-lifecycle CX implementations, built
              pipelines and workflows with Product and Engineering, and shipped
              an AI-assisted sentiment model that cut manual review by{" "}
              <strong className="font-semibold text-[var(--meg-ink)]">40%</strong>.
              Earlier roles at Marathon Petroleum and Nasdaq sharpened the same
              through line: SQL, automation, operational tools, and reliable
              delivery.
            </p>
            <p>
              On the side I&apos;m deepening Python and product building with
              hands-on projects, using AI to move faster while reviewing and
              validating everything myself.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
