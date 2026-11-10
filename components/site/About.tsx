export function About() {
  return (
    <section id="about" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-lagoon)]">
          About
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-4xl">
          How I work
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
          <p>
            I&apos;ve spent 10+ years in enterprise software delivery — turning
            business needs into data integrations and platform configurations
            for Fortune 100 clients, from discovery through launch.
          </p>
          <p>
            At Medallia I owned full-lifecycle CX implementations, built
            pipelines and workflows with Product and Engineering, and shipped an
            AI-assisted sentiment model that cut manual review by 40%. Earlier
            roles at Marathon Petroleum and Nasdaq sharpened the same through
            line: SQL, automation, operational tools, and reliable delivery.
          </p>
          <p>
            On the side I&apos;m deepening Python and product building with
            hands-on projects, using AI to move faster while reviewing and
            validating everything myself.
          </p>
        </div>
      </div>
    </section>
  );
}
