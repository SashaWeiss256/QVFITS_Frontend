/* Our Story */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import { STORY } from "../story";

/**
 * The client's own words, set quietly: a title beside one photograph, the
 * story in a single readable column, the vision set large, the meaning of the
 * name, and one closing line with one way on.
 */
export default function Story() {
  const { data: content } = useHomeContent();
  const photos = content?.movements?.items?.map((m) => m.photo) ?? [];
  const { vision, name } = STORY;

  return (
    <>
      {/* Opening: the page's h1 beside one photograph */}
      <section className="wrap grid items-end gap-10 pb-14 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-24">
        <div className="lg:col-span-6 lg:pb-6">
          <p className="kicker">{STORY.kicker}</p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.6vw,3.9rem)] leading-[1.1]">{STORY.title}</h1>
        </div>
        <div className="relative order-first mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden bg-beige lg:order-none lg:col-span-4 lg:col-start-9 lg:max-w-none">
          <Photo photo={photos[1]} label="Quivogue (QVFITS)" eager />
        </div>
      </section>

      {/* The story, one readable column */}
      <section className="wrap pb-16 lg:pb-28">
        <Reveal className="mx-auto max-w-[38rem] space-y-6 text-[1.02rem] leading-[1.8] text-ink-2 sm:text-[1.08rem]">
          {STORY.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </Reveal>
      </section>

      {/* The vision, set large */}
      <section className="bg-sand-200/60 py-16 lg:py-28">
        <Reveal className="wrap">
          <h2 className="text-center text-[1.05rem] font-normal uppercase tracking-[0.2em] text-ink-3">{vision.title}</h2>
          <p className="mx-auto mt-8 max-w-4xl text-center font-serif text-[clamp(1.35rem,3vw,2.4rem)] font-normal leading-[1.3]">{vision.statement}</p>
          <p className="mx-auto mt-8 max-w-xl text-center text-[1rem] leading-relaxed text-ink-2">{vision.text}</p>
        </Reveal>
      </section>

      {/* The meaning behind the name */}
      <section className="wrap py-16 lg:py-28">
        <Reveal className="mx-auto max-w-[38rem]">
          <h2 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)]">{name.title}</h2>
          <p className="mt-6 font-serif text-[1.2rem] italic text-ink">{name.line}</p>
          <div className="mt-6 space-y-6 text-[1.02rem] leading-[1.8] text-ink-2 sm:text-[1.08rem]">
            {name.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Reveal>
      </section>

      {/* Closing line and one way on */}
      <section className="wrap pb-20 text-center lg:pb-32">
        <p className="font-serif text-[clamp(1.4rem,2.8vw,2.1rem)]">{STORY.closing}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link className="btn btn--primary btn--lg" to="/shop">Shop the collection</Link>
          <Link className="link-arrow text-[0.92rem]" to="/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
