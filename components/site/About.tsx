import Image from "next/image";
import { SITE_ROLE_BLURBS } from "@/lib/siteContent";

/** Life outside work, as little stickers on the off-the-clock card. */
const STICKERS = [
  { icon: "🐶", label: "Sosa's dad" },
  { icon: "🏀", label: "Pickup hoops" },
  { icon: "🗣️", label: "Speaks 3 languages" },
];

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

        <div
          id="off-the-clock"
          className="retro-card mt-8 grid scroll-mt-24 items-center gap-7 p-6 sm:grid-cols-[auto_1fr] sm:p-8"
        >
          <figure className="polaroid mx-auto w-52 sm:w-56">
            <Image
              src="/images/sosa.jpg"
              width={900}
              height={1200}
              sizes="(min-width: 640px) 224px, 208px"
              alt="Sosa, a curly goldendoodle in a harness, sitting on the beach and looking back over one shoulder"
              className="block h-auto w-full"
            />
            <figcaption className="polaroid__caption">Sosa, beach day</figcaption>
          </figure>
          <div>
            <p className="retro-eyebrow">Off the clock</p>
            <p className="display mt-4 text-[1.9rem] font-semibold leading-tight text-[var(--ink)] sm:text-[2.4rem]">
              Meet Sosa.
            </p>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
              My goldendoodle and favorite beach-day partner. When I&apos;m not
              untangling data, you&apos;ll find me out with Sosa or in a pickup
              basketball game. I also speak English, Tigrinya, and Amharic.
            </p>
            <ul className="mt-5 flex flex-wrap gap-3" aria-label="Off the clock">
              {STICKERS.map((sticker) => (
                <li key={sticker.label}>
                  <span className="sticker">
                    <span aria-hidden>{sticker.icon}</span> {sticker.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
