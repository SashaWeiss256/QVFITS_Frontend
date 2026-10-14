/* Shop The Kit (from Quivogue shop.html renderKits()) */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/ui/Reveal";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import { useLooks } from "@/store/tanstackStore/queries/site";
import { inStock, productSizes } from "@/utils/stockLevel";

/**
 * Full kits already put together. "Add all to bag" takes the first in-stock
 * size and first colour of each piece and says so; a sold-out piece is left
 * out with a note rather than failing the whole kit.
 */
export default function Kits({ products }) {
  const { data: looks = [] } = useLooks();
  const { add } = useCart();
  const { money } = useCurrency();
  if (!looks.length || !products.length) return null;

  const byId = (id) => products.find((p) => p.id === id);

  const addAll = (look) => {
    let added = 0;
    const skipped = [];
    for (const p of look.items.map(byId).filter(Boolean)) {
      const size = productSizes(p).find((s) => inStock(p, s));
      if (!size) skipped.push(p.name);
      else {
        add({ productId: p.id, size, color: p.colors[0], qty: 1 });
        added++;
      }
    }
    if (added) notify(`${added} piece${added === 1 ? "" : "s"} added. Check sizes in your bag.`, { tone: "success" });
    if (skipped.length) notify(`${skipped[0]} is sold out, so I left it out.`);
  };

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="section-head center">
          <span className="kicker">Complete kits</span>
          <h2>Shop the kit</h2>
          <p className="lede">Full kits, already put together. Take the lot, or just the piece you are missing.</p>
        </div>
        <div className="grid-looks">
          {looks.map((look) => {
            const items = look.items.map(byId).filter(Boolean);
            const total = items.reduce((n, p) => n + p.price, 0);
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
                    <span className="font-semibold">{money(total)} the lot</span>
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
