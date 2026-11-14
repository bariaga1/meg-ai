import { SITE_HIGHLIGHTS } from "@/lib/siteContent";

/**
 * Highlights scroll past on an ink band. The list is rendered twice so the
 * loop is seamless; the copy is hidden from screen readers.
 */
export function Marquee() {
  const items = SITE_HIGHLIGHTS.map((h) => ({ metric: h.metric, label: h.label }));
  return (
    <div className="marquee" role="region" aria-label="Career highlights">
      <div className="marquee__track">
        {[0, 1].map((copy) =>
          items.map((item) => (
            <span
              key={`${copy}-${item.metric}`}
              className="marquee__item"
              aria-hidden={copy === 1 ? true : undefined}
            >
              <span className="display text-xl text-[var(--mustard)]">{item.metric}</span>
              <span>{item.label}</span>
              <span className="marquee__star" aria-hidden>
                ✺
              </span>
            </span>
          )),
        )}
      </div>
    </div>
  );
}
