import { SITE_ROLE_BLURBS } from "@/lib/siteContent";

export function About() {
  return (
    <section id="about" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--meg-ink-soft)]">
            About
          </p>
          <p className="mt-4 text-[18px] font-medium leading-relaxed text-[var(--meg-ink)] sm:text-[20px]">
            I&apos;ve spent 10+ years building enterprise software people rely
            on every day: CX platforms, data integrations, compliance tools, and
            trading-system quality. Along the way I&apos;ve been a consultant,
            analyst, and infrastructure QA lead.
          </p>
          <div className="mt-8 space-y-7">
            {SITE_ROLE_BLURBS.map((role) => (
              <div key={role.label}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--meg-ink-soft)]">
                  {role.label}
                </p>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--meg-ink-soft)]">
                  {role.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
