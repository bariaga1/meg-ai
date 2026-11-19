import Image from "next/image";
import { SpartanSticker } from "@/components/site/SpartanSticker";
import { SITE_ABOUT_CARDS } from "@/lib/siteContent";

/** Life outside work, as little stickers on the off-the-clock card. */
const STICKERS = ["Sosa's dad", "Car tinkerer", "Speaks 3 languages"];

export function About() {
  return (
    <section id="about" className="site-section scroll-mt-20">
      <div className="reveal mx-auto max-w-5xl">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
          <div>
            <p className="retro-eyebrow">About</p>
            <p className="display mt-5 max-w-3xl text-[1.6rem] font-semibold leading-snug text-[var(--ink)] sm:text-[2.1rem]">
              Most of my work has lived in the gap between what a business needs
              and what its software actually does.
            </p>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
              I&apos;ve done it as a consultant, an analyst, and a QA engineer. The
              titles changed but the job stayed the same: listen closely, get the
              data where it needs to go, and build tools people keep using.
            </p>
          </div>
          <figure className="polaroid polaroid--tilt-right mx-auto w-48 sm:w-56 md:mr-12 lg:mr-16">
            <Image
              src="/images/omega.jpg"
              width={899}
              height={1200}
              sizes="(min-width: 640px) 224px, 192px"
              alt="Omega smiling in a navy suit, white shirt and red tie"
              className="block h-auto w-full"
            />
            <figcaption className="polaroid__caption">Omega</figcaption>
          </figure>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SITE_ABOUT_CARDS.map((card) => (
            <div key={card.label} className="retro-card retro-lift p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--orange)]">
                {card.label}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                {card.text}
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
            <figcaption className="polaroid__caption">Sosa</figcaption>
          </figure>
          <div>
            <p className="retro-eyebrow">Off the clock</p>
            <p className="display mt-4 text-[1.9rem] font-semibold leading-tight text-[var(--ink)] sm:text-[2.4rem]">
              Meet Sosa.
            </p>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
              My goldendoodle and best buddy. When I&apos;m not deep in some
              rabbit hole, you&apos;ll find me out with Sosa or working on my
              car (German engineering keeps me busy). I also speak English,
              Tigrinya, and Amharic.
            </p>
            <ul className="mt-5 flex flex-wrap gap-3" aria-label="Off the clock">
              {STICKERS.map((sticker) => (
                <li key={sticker}>
                  <span className="sticker">
                    <span className="sticker__dot" aria-hidden />
                    {sticker}
                  </span>
                </li>
              ))}
              <li>
                <SpartanSticker />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
