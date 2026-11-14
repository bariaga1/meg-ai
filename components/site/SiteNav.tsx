type SiteNavProps = {
  onOpenMeg?: () => void;
};

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#highlights", label: "Highlights" },
  { href: "#resume", label: "Resume" },
  { href: "#work", label: "Work" },
  { href: "#meg", label: "Meg" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteNav({ onOpenMeg }: SiteNavProps) {
  return (
    <nav className="site-nav sticky top-0 z-40" aria-label="Site">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top" className="display text-lg text-[var(--ink)]">
          itsomega<span className="text-[var(--orange)]">.</span>com
        </a>
        <ul className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--ink)] sm:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              {link.href === "#meg" && onOpenMeg ? (
                <button type="button" onClick={onOpenMeg} className="site-nav__link uppercase">
                  {link.label}
                </button>
              ) : (
                <a href={link.href} className="site-nav__link">
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        {/* Phones: one compact action instead of a three-row link list. */}
        {onOpenMeg ? (
          <button
            type="button"
            onClick={onOpenMeg}
            className="retro-btn retro-btn--primary px-3.5 py-1.5 text-[13px] sm:hidden"
          >
            Ask Meg
          </button>
        ) : null}
      </div>
      <div className="retro-stripes h-1.5" aria-hidden />
    </nav>
  );
}
