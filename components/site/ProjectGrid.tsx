import { SITE_PROJECTS, type SiteProject } from "@/lib/siteProjects";

function ProjectAction({ project }: { project: SiteProject }) {
  const href = project.liveUrl ?? project.githubUrl;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="retro-btn">
        {project.liveUrl ? "Live demo →" : "GitHub →"}
      </a>
    );
  }
  return (
    <span className="text-sm font-bold italic text-[var(--ink-soft)]">Live demo soon</span>
  );
}

export function ProjectGrid() {
  return (
    <section id="work" className="site-section scroll-mt-20">
      <div className="mx-auto max-w-5xl">
        <div className="reveal">
          <p className="retro-eyebrow">Side projects</p>
          <h2 className="display mt-3 max-w-2xl text-4xl text-[var(--ink)] sm:text-6xl">
            Things I&apos;m building
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
            Personal work that shows newer stacks. Live demos will land here as
            each one is hosted.
          </p>
        </div>
        <div className="reveal mt-10 grid gap-6 md:grid-cols-3">
          {SITE_PROJECTS.map((project) => (
            <article
              key={project.id}
              className="project-card retro-card retro-lift flex flex-col"
            >
              <div className="project-card__cap" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="display text-2xl text-[var(--ink)]">{project.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  {project.blurb}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <ProjectAction project={project} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
