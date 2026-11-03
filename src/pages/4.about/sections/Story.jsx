/* Our Story */
import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Reveal from "@/components/motion/Reveal";
import { cn } from "@/utils/cn";
import { STORY } from "../story";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** One About picture: local WebP and JPEG, the QV icon already on the clothes, and the same film grain as the home hero. `drift` lets GSAP slide the photograph inside its frame. */
function Pic({ id, alt, className, eager = false, drift = false, sizes = "(max-width: 700px) 80vw, 560px" }) {
  const img = (
    <picture>
      <source type="image/webp" srcSet={`/photos/${id}-640.webp 640w, /photos/${id}.webp 1024w`} sizes={sizes} />
      <img className="absolute inset-0 h-full w-full object-cover" src={`/photos/${id}.jpg`} width="1024" height="1024" alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} />
    </picture>
  );
  return (
    <div className={cn("relative overflow-hidden bg-beige", className)}>
      {drift ? <div data-drift className="absolute inset-x-0 -inset-y-[7%]">{img}</div> : img}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><div className="grain" /></div>
    </div>
  );
}

// The story as a mosaic: four short paragraphs and three photographs.
const PICS = {
  home: { id: "about-3", alt: "A QVFITs seamless set worn at home with a cream cardigan" },
  court: { id: "about-2", alt: "A QVFITs tennis set on a Kampala court at sunset" },
  pool: { id: "about-4", alt: "A QVFITs swimsuit by an infinity pool at sunrise" },
};
// Each tile's place on a laptop; on a phone they simply follow one another.
const TILES = [
  { text: STORY.paragraphs[1], tone: "bg-sand-200/60", at: "lg:col-span-4 lg:col-start-1 lg:row-start-1" },
  { pic: "home", at: "lg:col-span-4 lg:col-start-5 lg:row-span-2 lg:row-start-1" },
  { text: STORY.paragraphs[2], tone: "bg-cream", at: "lg:col-span-4 lg:col-start-9 lg:row-start-1" },
  { pic: "court", at: "lg:col-span-4 lg:col-start-1 lg:row-start-2" },
  { text: STORY.paragraphs[3], tone: "bg-sand-200/60", at: "md:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-2" },
  { pic: "pool", wide: true, at: "md:col-span-2 lg:col-span-8 lg:col-start-1 lg:row-start-3" },
  { text: STORY.paragraphs[4], tone: "bg-cream", at: "md:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-3" },
];
// The text tiles, in reading order, for their numbers.
const TEXTS = TILES.filter((t) => t.text);

/**
 * The client's own words, told like a feature in a fashion journal. A short
 * hero with the studio portrait opens the page; the story then
 * unfolds beside one picture that changes as each paragraph is read; the
 * vision is set in the brand's plum; the name is taken apart into Qui and Vogue.
 */
export default function Story() {
  const { vision, name } = STORY;
  const root = useRef(null);

  // The tiles rise in one after another as the mosaic comes into view, and each photograph
  // drifts a little inside its frame as you scroll. Nothing moves for anyone who asks for less motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray("[data-tile]");
        gsap.set(tiles, { opacity: 0, y: 56 });
        ScrollTrigger.batch(tiles, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.14 }),
        });
        gsap.utils.toArray("[data-drift]").forEach((d) => {
          gsap.fromTo(d, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: d.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <>
      {/* Hero: short and quiet, in the home page's manner. The studio portrait full bleed under a dark
          grade, one line of headline, one sentence, one way on. */}
      <section className="relative isolate flex min-h-[min(68svh,560px)] items-end overflow-hidden bg-ink lg:min-h-[min(72svh,640px)]">
        <Pic id="about-1" alt="A QVFITs pink zip top and leggings in a sunlit Kampala studio" eager sizes="100vw" className="!absolute inset-0 -z-10 [&_img]:object-[60%_28%] lg:[&_img]:object-[60%_8%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/25 to-transparent lg:bg-linear-to-r lg:from-ink/70 lg:via-ink/20" aria-hidden="true" />
        <div className="wrap w-full pb-12 pt-40 lg:pb-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em] text-cream">
              Inspired by Movement. <span className="text-cream/70">Driven by Vision.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[1rem] leading-snug text-cream/85 sm:mt-4 sm:text-[1.1rem]">{STORY.paragraphs[0]}</p>
            <a className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cream px-6 text-[0.92rem] font-medium text-ink transition-colors duration-300 hover:bg-white sm:mt-8" href="#story">Read our story</a>
          </div>
        </div>
      </section>

      {/* The story: a mosaic of words and photographs */}
      <section ref={root} id="story" className="wrap scroll-mt-24 pb-16 pt-12 sm:pt-16 lg:pb-28 lg:pt-24">
        <div className="grid gap-8 md:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:gap-5">
          {TILES.map((t, i) =>
            t.pic ? (
              <div key={i} data-tile className={cn("min-w-0", t.at)}>
                <Pic id={PICS[t.pic].id} alt={PICS[t.pic].alt} drift className={cn("w-full rounded-[1rem] md:rounded-[1.5rem]", t.wide ? "aspect-[4/3] md:aspect-[16/10] lg:h-full lg:min-h-[22rem] lg:aspect-auto" : "aspect-[4/3] md:aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[28rem]")} />
              </div>
            ) : (
              // On a phone the words read like a journal: numbered, on a hairline, no box; from a tablet up, the tinted tile.
              <div key={i} data-tile className={cn("flex flex-col justify-between gap-6 border-t border-line-2 pt-5 md:rounded-[1.5rem] md:border-0 md:p-9 lg:p-10", t.tone, "max-md:bg-transparent", t.at)}>
                <span className="font-serif text-[0.95rem] italic text-brand-500">{String(TEXTS.indexOf(t) + 1).padStart(2, "0")}</span>
                <p className="text-[1rem] leading-[1.8] text-ink-2 lg:text-[1.04rem] lg:leading-[1.9]">{t.text}</p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* The vision, in a soft shade of the page */}
      <section className="bg-sand-200/60">
        <Reveal className="wrap relative py-16 lg:py-32">
          <p className="text-[1rem] text-ink-3">{vision.title}</p>
          <p className="mt-8 max-w-3xl border-l-2 border-brand-500 pl-5 font-serif text-[clamp(1.3rem,2.2vw,1.85rem)] font-normal leading-[1.5] text-ink lg:mt-12 lg:pl-8">{vision.statement}</p>
          <p className="mt-10 max-w-md text-[1.02rem] leading-relaxed text-ink-2 lg:mt-12">{vision.text}</p>
        </Reveal>
      </section>

      {/* The name, taken apart */}
      <section className="wrap py-16 lg:py-32">
        <Reveal>
          <h2 className="text-center font-serif text-[clamp(1.25rem,2vw,1.6rem)] font-normal text-ink-2">{name.title}</h2>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-2 items-end gap-4 text-center sm:gap-8 lg:mt-12">
            <div className="lg:text-right">
              <p className="font-serif text-[clamp(2.6rem,5vw,3.4rem)] leading-[1.1] text-ink">Qui</p>
              <p className="mt-2 text-[0.9rem] text-ink-3 lg:pr-3">representing quality</p>
            </div>
            <div className="lg:text-left">
              <p className="font-serif text-[clamp(2.6rem,5vw,3.4rem)] leading-[1.1] text-brand-500">Vogue</p>
              <p className="mt-2 text-[0.9rem] text-ink-3 lg:pl-3">representing fashion</p>
            </div>
          </div>
          <p className="mt-8 text-center font-serif text-[clamp(1.05rem,1.6vw,1.3rem)] italic text-ink lg:mt-10">{name.line}</p>
        </Reveal>
        <Reveal className="mx-auto mt-14 grid max-w-5xl gap-x-14 gap-y-6 text-[1rem] leading-[1.9] text-ink-2 lg:mt-16 lg:text-[1.04rem] lg:grid-cols-2">
          {name.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </Reveal>
      </section>

      {/* Closing line and one way on */}
      <section className="bg-sand-200/60 py-16 text-center lg:py-32">
        <Reveal className="wrap">
          <p className="mx-auto max-w-2xl font-serif text-[clamp(1.4rem,2.5vw,2.1rem)] leading-[1.3]">{STORY.closing}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link className="btn btn--primary btn--lg" to="/shop">Shop the collection</Link>
            <Link className="link-arrow text-[0.92rem]" to="/contact">Contact us</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
