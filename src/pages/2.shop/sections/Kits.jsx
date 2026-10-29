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
                {/* The kit worn together */}
                <div className="look__media"><Photo photo={look.photo} label={look.title} /></div>
                <div className="look__body">
                  <p className="look__count">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
                  <h3 className="look__title">{look.title}</h3>
                  <p className="look__note">{look.note}</p>
                  {/* The pieces in it, each a link to its own page */}
                  <ul className="look__items">
                    {items.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.slug}`}>
                          <span className="look__thumb"><Photo photo={p.photos[0]} label={p.name} /></span>
                          <span className="look__piece">{p.name}</span>
                          <span className="look__price">{money(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* The kit's price, the saving against buying one by one, and the one action */}
                  <div className="look__foot">
                    <div>
                      <p className="look__total">{money(look.price)}<span> for the lot</span></p>
                      {saving > 0 && <p className="look__save">You save {money(saving)}</p>}
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
