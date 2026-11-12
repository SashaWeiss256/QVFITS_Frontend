/* Shop The Kit (from Quivogue shop.html renderKits()) */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/motion/Reveal";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useLooks, usePageCopy } from "@/store/tanstackStore/queries/site";
import { addKit } from "@/utils/kits";

/**
 * Full kits already put together. "Add all to bag" takes the first colour
 * and size in stock of each piece and says so; the lines carry the kit's id,
 * so checkout charges the kit price while the whole set is in the bag.
 */
export default function Kits({ products }) {
  const { data: looks = [] } = useLooks();
  const { data: copy } = usePageCopy("shop");
  const { add } = useCart();
  const { money } = useCurrency();
  if (!products.length) return null;
  if (!looks.length) return null;

  // A look may name a piece that has left the catalogue; those are dropped.
  const byId = (id) => products.find((p) => p.id === id);

  const addAll = (look) => addKit(look, look.items.map(byId).filter(Boolean), add);

  return (
    <section className="section section--tight scroll-mt-24" id="kits">
      <div className="wrap">
        <div className="section-head center">
          <span className="kicker">{copy?.kits.kicker}</span>
          <h2>{copy?.kits.title}</h2>
          <p className="lede">{copy?.kits.lede}</p>
        </div>
        <div className="grid gap-[clamp(28px,4vw,56px)]">
          {looks.map((look) => {
            const items = look.items.map(byId).filter(Boolean);
            // The kit's own price; the saving shows when it beats buying the pieces one by one.
            const saving = look.separate - look.price;
            return (
              // A sand panel, the photo on one side and the pieces on the other, alternating down the page
              <Reveal as="article" key={look.id} className="group grid bg-sand-100 min-[900px]:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
                {/* The kit worn together: square on a phone; beside the pieces it fills the panel's height
                    (set by the text, at least 460px) instead of standing at its own full portrait height.
                    Cropped from near the top, so faces stay in frame. */}
                <div className="relative aspect-square overflow-hidden bg-beige [&_img]:object-[50%_20%] min-[900px]:aspect-auto min-[900px]:min-h-[460px] min-[900px]:group-even:order-2">
                  <Photo photo={look.photo} label={look.title} className="absolute inset-0" />
                </div>
                <div className="flex flex-col justify-center p-[clamp(24px,3vw,44px)]">
                  <p className="mb-2.5 mt-0 text-[0.86rem] text-ink-3">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
                  <h3 className="m-0 text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.1]">{look.title}</h3>
                  <p className="mb-0 mt-3 max-w-[46ch] text-[0.97rem] leading-[1.6] text-ink-2">{look.note}</p>
                  {/* The pieces in it, each a link to its own page */}
                  <ul className="mb-0 mt-5 list-none border-t border-line-2 p-0">
                    {items.map((p) => (
                      <li key={p.id} className="border-b border-line-2">
                        <Link className="group/piece grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 py-2.5 transition-colors duration-200" to={`/product/${p.slug}`}>
                          <span className="relative block aspect-[3/4] w-11 overflow-hidden bg-beige"><Photo photo={p.photos[0]} label={p.name} labels={false} /></span>
                          <span className="font-display text-base font-normal leading-[1.3] tracking-normal transition-colors duration-200 group-hover/piece:text-brand-600">{p.name}</span>
                          <span className="text-[0.92rem] tabular-nums text-ink-2">{money(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* The kit's price, the saving against buying one by one, and the one action */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-[18px]">
                    <div>
                      <p className="m-0 font-display text-[1.5rem] font-normal tabular-nums tracking-normal text-ink">
                        {money(look.price)}<span className="font-body text-[0.86rem] text-ink-3"> for the lot</span>
                      </p>
                      {saving > 0 && <p className="mb-0 mt-0.5 text-[0.88rem] font-medium text-success">You save {money(saving)}</p>}
                    </div>
                    <button type="button" className="btn btn--primary" onClick={() => addAll(look)}>Add all to bag</button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
