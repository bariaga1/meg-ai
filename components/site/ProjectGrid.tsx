import { SITE_PROJECTS, type SiteProject } from "@/lib/siteProjects";

function ProjectAction({ project }: { project: SiteProject }) {
  if (project.liveUrl) {
    return (
      <a
        href={project.liveUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-[var(--meg-lagoon-deep)] transition hover:text-[var(--meg-lagoon)]"
      >
        Live demo →
      </a>
    );
  }
  if (project.githubUrl) {
    return (
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-[var(--meg-lagoon-deep)] transition hover:text-[var(--meg-lagoon)]"
      >
        GitHub →
      </a>
    );
  }
  return (
    <span className="text-sm font-medium text-[var(--meg-ink-soft)]">
      Live demo soon
    </span>
  );
}

export function ProjectGrid() {
  return (
    <section id="work" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--meg-lagoon)]">
          Side projects
        </p>
        <h2 className="mt-2 text-center font-[family-name:var(--font-meg-display)] text-3xl font-semibold tracking-tight text-[var(--meg-ink)] sm:text-4xl">
          Things I&apos;m building
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-[var(--meg-ink-soft)]">
          Personal work that shows newer stacks. Live demos will land here as
          each one is hosted.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SITE_PROJECTS.map((project) => (
            <article
              key={project.id}
              className="meg-glass flex flex-col rounded-[1.5rem] p-5"
            >
              <h3 className="font-[family-name:var(--font-meg-display)] text-xl font-semibold text-[var(--meg-ink)]">
                {project.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--meg-ink-soft)]">
                {project.blurb}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[var(--meg-hairline)] px-2.5 py-1 text-[11px] text-[var(--meg-ink-soft)]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <ProjectAction project={project} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
