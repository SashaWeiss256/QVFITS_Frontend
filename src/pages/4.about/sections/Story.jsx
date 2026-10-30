/* Our Story */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import { STORY } from "../story";

/**
 * The story, with nothing to spare: a headline and one line beside a single
 * photograph; one statement set large; three short principles; one way on.
 * The showroom invitation follows on the page.
 */
export default function Story() {
  const { data: content } = useHomeContent();
  const photos = content?.movements?.items?.map((m) => m.photo) ?? [];

  return (
    <>
      {/* Opening: the page's h1, one line, one photograph */}
      <section className="wrap grid items-end gap-12 pb-20 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-24">
        <div className="lg:col-span-6 lg:pb-6">
          <h1 className="text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.08]">{STORY.title}</h1>
          <p className="mt-8 max-w-sm text-[1.05rem] leading-relaxed text-ink-2">{STORY.lede}</p>
        </div>
        <div className="relative order-first aspect-[4/5] overflow-hidden bg-beige lg:order-none lg:col-span-4 lg:col-start-9">
          <Photo photo={photos[1]} label="Quivogue (QVFITS)" eager />
        </div>
      </section>

      {/* The statement */}
      <section className="py-16 lg:py-28">
        <Reveal className="wrap">
          <p className="mx-auto max-w-4xl font-serif font-normal text-[clamp(1.6rem,3.2vw,2.7rem)] leading-[1.25] sm:text-center">{STORY.statement}</p>
        </Reveal>
      </section>

      {/* Principles: three short lines */}
      <section className="wrap pb-24 lg:pb-36">
        <ul className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-14">
          {STORY.principles.map((p) => (
            <li key={p.id} className="border-t border-line pt-6">
              <h2 className="font-serif text-[1.25rem] font-medium leading-snug">{p.title}</h2>
              <p className="mt-3 max-w-xs text-[0.98rem] leading-relaxed text-ink-2">{p.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-24">
          <Link className="btn btn--primary btn--lg" to="/shop">Shop the collection</Link>
          <Link className="link-arrow text-[0.92rem]" to="/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
