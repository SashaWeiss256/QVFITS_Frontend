/* The Craft: Seamless And Seam-Fit (product page) */
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
 * Shown under a product: the two ways a piece is built, each beside a real
 * piece made that way. Small and calm, a heading and two short rows, so it
 * explains the range without taking over the page.
 */
export default function Craft() {
  const { data: products = [] } = useProducts();
  const ways = WAYS.map((w) => ({ ...w, product: products.find((p) => p.slug === w.slug) })).filter((w) => w.product);
  if (!ways.length) return null;

  return (
    <section className="section--tight border-t border-line">
      <div className="wrap">
        <Reveal className="mb-8 max-w-xl">
          <h2 className="text-[clamp(1.35rem,2vw,1.8rem)]">Two ways of making.</h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">Every piece is built one of two ways, chosen for what it has to do. Never by the season.</p>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-14">
          {ways.map((w) => (
            <Reveal key={w.slug}>
              <Link to={`/product/${w.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-5 sm:grid-cols-[9rem_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden bg-beige">
                  <Photo photo={w.product.photos[0]} label={w.product.name} className="transition-transform duration-[1.6s] ease-q group-hover:scale-[1.04]" />
                </div>
                <div>
                  <p className="font-serif text-[1.4rem] leading-none">{w.name}</p>
                  <p className="mt-2 text-[0.85rem] text-brand-600">{w.when}</p>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">{w.text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
