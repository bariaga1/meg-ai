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
    <nav className="site-nav sticky top-0 z-40 border-b border-[var(--site-line)] bg-[rgba(249,247,242,0.9)] backdrop-blur-md" aria-label="Site">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <a
          href="#top"
          className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--meg-ink)]"
        >
          itsomega.com
        </a>
        <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--meg-ink)]">
          {LINKS.map((link) => (
            <li key={link.href}>
              {link.href === "#meg" && onOpenMeg ? (
                <button
                  type="button"
                  onClick={onOpenMeg}
                  className="transition hover:opacity-60"
                >
                  {link.label}
                </button>
              ) : (
                <a href={link.href} className="transition hover:opacity-60">
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
