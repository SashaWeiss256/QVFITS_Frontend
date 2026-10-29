/* Kit Card */
import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import Modal from "@/components/ui/Modal";
import { addKit } from "@/utils/kits";
import Photo from "./Photo";

/**
 * A kit in the shop grid, dressed like the product card beside it: a tall
 * photograph with a Kit label, and under it the name, the kit price against
 * the pieces bought one by one, and the pieces as small links (each piece links to its own page). "Add all"
 * rises over the picture on hover (always there on touch), and checkout
 * charges the kit price while the whole set is in the bag. A kit has no page
 * of its own, so the photo and the name open it in a dialog: the pieces, the
 * price against buying them one by one, and Add all.
 */
export default function KitCard({ kit }) {
  const { add } = useCart();
  const { money } = useCurrency();
  // What buying the pieces one by one would cost beyond the kit price; nothing is shown when the kit isn't cheaper.
  const saving = kit.separate - kit.price;
  const [open, setOpen] = useState(false);
  return (
    <article className="group/card relative">
      {/* Picture, with the Kit label and the Add all bar */}
      <div className="relative aspect-[3/4] overflow-hidden bg-sand-100">
        <button type="button" onClick={() => setOpen(true)} aria-label={`See what is in ${kit.name}`} tabIndex={-1} className="absolute inset-0 block cursor-pointer">
          <Photo photo={kit.photos[0]} label={kit.name} className="transition-transform duration-[1.4s] ease-q group-hover/card:scale-[1.03]" />
        </button>
        <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[0.72rem] font-medium leading-none text-cream">
          {saving > 0 ? `Kit, save ${money(saving)}` : "Kit"}
        </span>
        <button
          type="button"
          onClick={() => addKit(kit, kit.pieces, add)}
          aria-label={`Add all of ${kit.name} to bag`}
          className="absolute inset-x-3 bottom-3 min-h-11 bg-cream/95 text-[0.85rem] font-medium text-ink backdrop-blur transition-[opacity,transform,background-color] duration-500 ease-q hover:bg-ink hover:text-cream [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          Add all to bag
        </button>
      </div>

      {/* Words: name, price, the pieces */}
      <div className="pt-4">
        <h3 className="m-0 font-display text-[1.1rem] leading-snug">
          <button type="button" onClick={() => setOpen(true)} className="cursor-pointer py-1.5 text-left text-ink transition-colors hover:text-brand-600">{kit.name}</button>
        </h3>
        <p className="mt-1 text-[0.88rem] text-ink-2 [&_s]:mr-1.5 [&_s]:text-ink-4 [&_b]:font-medium [&_b]:text-brand-600">
          {saving > 0 && <s>{money(kit.separate)}</s>}
          <b>{money(kit.price)}</b>
        </p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-3">
          {kit.pieces.length} pieces:{" "}
          {kit.pieces.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link className="transition-colors hover:text-ink hover:underline" to={`/product/${p.slug}`}>{p.name}</Link>
            </span>
          ))}
        </p>
      </div>
      {/* The kit opened: its pieces, the price, Add all */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title={kit.name} size="lg">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
          <div className="relative aspect-[16/9] overflow-hidden bg-sand-100 sm:aspect-[3/4]"><Photo photo={kit.photos[0]} label={kit.name} className="object-[50%_20%]" /></div>
          <div className="flex min-w-0 flex-col">
            {kit.note && <p className="m-0 text-[0.95rem] leading-relaxed text-ink-2">{kit.note}</p>}
            <ul className="m-0 mt-4 list-none divide-y divide-line border-y border-line p-0">
              {kit.pieces.map((p) => (
                <li key={p.id}>
                  <Link to={`/product/${p.slug}`} onClick={() => setOpen(false)} className="group flex items-center gap-3 py-3">
                    <span className="relative block aspect-[3/4] w-12 shrink-0 overflow-hidden bg-beige"><Photo photo={p.photos[0]} label={p.name} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.92rem] group-hover:text-brand-600">{p.name}</span>
                      <span className="block text-[0.78rem] text-ink-3">{p.category}</span>
                    </span>
                    <span className="text-[0.85rem] text-ink-2">{money(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="sticky -bottom-6 z-10 mt-auto flex flex-wrap items-center justify-between gap-3 bg-cream pb-1 pt-4 sm:static sm:pt-5">
              <p className="m-0 [&_s]:mr-1.5 [&_s]:text-ink-4">
                {saving > 0 && <s className="text-[0.88rem]">{money(kit.separate)}</s>}
                <b className="font-display text-[1.3rem] text-brand-600">{money(kit.price)}</b>
                {saving > 0 && <span className="mt-0.5 block text-[0.8rem] text-brand-600">You save {money(saving)}</span>}
              </p>
              <button type="button" className="btn btn--primary" onClick={() => { addKit(kit, kit.pieces, add); setOpen(false); }}>Add all to bag</button>
            </div>
          </div>
        </div>
      </Modal>
    </article>
  );
}
