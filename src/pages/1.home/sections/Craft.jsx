/* The Craft: Seamless And Seam-Fit */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";
import { useProducts } from "@/store/tanstackStore/queries/site";

// The two ways QVFITS builds a piece, in the shop's own words (from its FAQ),
// each shown on a real piece made that way. The pieces are found by slug, so
// if one is retired its half quietly disappears.
const WAYS = [
  {
    slug: "sculpt-seamless-set",
    name: "Seamless",
    text: "Knitted as one tube, with no side seams to rub. It hugs, holds its shape and moves with you.",
    when: "For comfort and shape",
  },
  {
    slug: "studio-two-piece",
    name: "Seam-fit",
    text: "Cut and stitched from panels, so support, structure and mesh go exactly where they are needed.",
    when: "For support",
  },
];

/**
 * Two tall photographs, the second set lower than the first, each with the
 * name of its construction large beneath it. Explains the range without a
 * single sales line, the way a house explains its craft.
 */
export default function Craft() {
  const { data: products = [] } = useProducts();
  const ways = WAYS.map((w) => ({ ...w, product: products.find((p) => p.slug === w.slug) })).filter((w) => w.product);
  if (!ways.length) return null;

  return (
    <section className="section">
      <div className="wrap">
        {/* Heading */}
        <Reveal className="mb-16 grid gap-6 lg:mb-24 lg:grid-cols-12">
          <h2 className="lg:col-span-6">Two ways of making.</h2>
          <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-8 lg:self-end">
            Every piece is built one of two ways, chosen for what it has to do. Never by the season.
          </p>
        </Reveal>

        {/* The two ways */}
        <div className="grid gap-16 sm:grid-cols-2 sm:gap-8 lg:gap-24">
          {ways.map((w, i) => (
            <Reveal key={w.slug} className={i === 1 ? "sm:mt-40" : ""}>
              <Link to={`/product/${w.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-beige">
                  <Photo photo={w.product.photos[0]} label={w.product.name} className="transition-transform duration-[1.6s] ease-q group-hover:scale-[1.04]" />
                </div>
                <div className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr] lg:gap-10">
                  <p className="font-logo text-[clamp(2.6rem,5vw,4.4rem)] uppercase leading-none tracking-[0.06em]">{w.name}</p>
                  <div className="lg:pt-2">
                    <p className="text-[0.85rem] text-brand-600">{w.when}</p>
                    <p className="mt-2 max-w-sm leading-relaxed text-ink-2">{w.text}</p>
                    <p className="mt-4 text-[0.88rem] text-ink-3 transition-colors group-hover:text-ink">Shown: {w.product.name}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
