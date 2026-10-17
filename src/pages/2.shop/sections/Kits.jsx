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
        <div className="grid-looks">
          {looks.map((look) => {
            const items = look.items.map(byId).filter(Boolean);
            // The kit's own price; the saving shows when it beats buying the pieces one by one.
            const saving = look.separate - look.price;
            return (
              <Reveal as="article" key={look.id} className="look">
                <div className="look__media"><Photo photo={look.photo} label={look.title} /></div>
                <div className="look__body">
                  <h3>{look.title}</h3>
                  <p className="mt-1.5 mb-0 text-[.9rem] text-ink-3">{look.note}</p>
                  <ul className="look__items">
                    {items.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.slug}`}>
                          <span className="look__thumb"><Photo photo={p.photos[0]} label={p.name} /></span>
                          <span><strong>{p.name}</strong><em>{money(p.price)}</em></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold">
                      {money(look.price)} the lot
                      {saving > 0 && <span className="ml-2 text-[.82rem] font-semibold text-brand-600">Save {money(saving)}</span>}
                    </span>
                    <button type="button" className="btn btn--soft" onClick={() => addAll(look)}>Add all to bag</button>
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
