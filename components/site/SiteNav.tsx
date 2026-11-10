const LINKS = [
  { href: "#top", label: "Omega" },
  { href: "#work", label: "Work" },
  { href: "#meg", label: "Meg" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteNav() {
  return (
    <nav
      className="site-nav sticky top-0 z-40 border-b border-[var(--meg-hairline)] bg-[rgba(228,236,238,0.78)] backdrop-blur-md"
      aria-label="Site"
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <a
          href="#top"
          className="font-[family-name:var(--font-meg-display)] text-lg font-semibold tracking-tight text-[var(--meg-ink)]"
        >
          Omega
        </a>
        <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--meg-ink-soft)]">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition hover:text-[var(--meg-lagoon-deep)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
