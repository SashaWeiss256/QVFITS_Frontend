/* Our Story */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import { STORY } from "../story";

/**
 * The story in three parts, read top to bottom like a magazine feature:
 * the title and a tall photograph; the name's meaning set large across the
 * page; then the chapters, each a photograph beside its words, alternating
 * sides. Photographs are the site's own (the movement pictures).
 */
export default function Story() {
  const { data: content } = useHomeContent();
  const photos = content?.movements?.items?.map((m) => m.photo) ?? [];

  return (
    <>
      {/* Opening: the page's h1 and a tall photograph */}
      <section className="wrap grid gap-12 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-24">
        <div className="flex flex-col justify-end lg:col-span-6 lg:pb-8">
          <p className="kicker">{STORY.kicker}</p>
          <h1 className="text-[clamp(2.375rem,5.6vw,4.75rem)]">{STORY.title}</h1>
          <p className="mt-8 max-w-md text-[1.1rem] leading-relaxed text-ink-2">{STORY.lede}</p>
        </div>
        <div className="relative order-first aspect-[4/5] overflow-hidden bg-beige lg:order-none lg:col-span-5 lg:col-start-8">
          <Photo photo={photos[1]} label="Quivogue (QVFITS)" eager />
        </div>
      </section>

      {/* The name: the statement across the page */}
      <section className="border-y border-line py-24 lg:py-36">
        <Reveal className="wrap">
          <p className="mx-auto max-w-5xl font-display sm:text-center text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.15]">{STORY.statement}</p>
        </Reveal>
      </section>

      {/* Chapters: photograph and words, alternating sides */}
      <section className="wrap py-24 lg:py-36">
        <div className="flex flex-col gap-28 lg:gap-44">
          {STORY.chapters.map((c, i) => (
            <article key={c.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              <Reveal className={`relative aspect-[4/5] overflow-hidden bg-beige lg:col-span-5 ${i % 2 ? "lg:order-2 lg:col-start-8" : ""}`}>
                <Photo photo={photos[c.photo]} label={c.title} />
              </Reveal>
              <Reveal className={`lg:col-span-5 ${i % 2 ? "lg:order-1 lg:col-start-2" : "lg:col-start-7"}`}>
                <h2 className="font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.05]">{c.title}</h2>
                <div className="mt-8 space-y-5">
                  {c.paras.map((p) => <p key={p.slice(0, 24)} className="max-w-md text-[1.05rem] leading-[1.75] text-ink-2">{p}</p>)}
                </div>
              </Reveal>
            </article>
          ))}
        </div>

        {/* Onward */}
        <Reveal className="mt-28 flex flex-col items-start gap-6 border-t border-line pt-12 sm:flex-row sm:items-center sm:justify-between lg:mt-44">
          <p className="max-w-lg font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight">{STORY.home.title}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link className="btn btn--primary btn--lg" to="/shop">Shop the collection</Link>
            <Link className="link-arrow text-[0.92rem]" to="/contact">Contact us</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
