import { MegChat } from "@/components/chat/MegChat";

export function MegHighlight() {
  return (
    <section id="meg" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-lagoon)]">
              Live · text agent
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-4xl">
              Chat with Meg
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
              Ask about roles, skills, or projects. Answers stay grounded in the
              public resume.
            </p>
          </div>
        </div>
        <div className="site-meg-panel meg-glass overflow-hidden rounded-[1.75rem]">
          <MegChat embedded />
        </div>
      </div>
    </section>
  );
}
