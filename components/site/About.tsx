import { SITE_ROLE_BLURBS } from "@/lib/siteContent";

export function About() {
  return (
    <section id="about" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <p className="retro-eyebrow">About</p>
        <p className="display mt-5 max-w-3xl text-[1.6rem] font-semibold leading-snug text-[var(--ink)] sm:text-[2.1rem]">
          I&apos;ve spent 10+ years building enterprise software people rely on
          every day: CX platforms, data integrations, compliance tools, and
          trading-system quality.
        </p>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
          Along the way I&apos;ve been a consultant, analyst, and infrastructure
          QA lead.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {SITE_ROLE_BLURBS.map((role) => (
            <div key={role.label} className="retro-card retro-lift p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--orange)]">
                {role.label}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                {role.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
