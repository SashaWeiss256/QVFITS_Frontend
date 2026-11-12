/* Cart Panel */
import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOffers, useProductsByIds, useSettings, useStyleWith } from "@/store/tanstackStore/queries/site";
import { saleOf } from "@/utils/stockLevel";
import OutfitCard from "./OutfitCard";
import Photo from "./Photo";
import { t } from "@/i18n/translate";

// The bag in the drawer. Totals here are a preview; checkout prices the bag
// again on the server side before anything is ordered.
export default function CartPanel() {
  const { lines, remove, setQty, closeDrawer } = useCart();
  const { money } = useCurrency();
  const { data: products = [] } = useProductsByIds(lines.map((l) => l.productId));
  const { data: settings } = useSettings();
  const { data: offers } = useOffers();
  // "Complete the look" is built around the newest piece in the bag; asked for before any early return, as hooks must be.
  const lastId = lines[lines.length - 1]?.productId;
  const { data: looks = [] } = useStyleWith(lastId);

  if (!lines.length) {
    return (
      <>
        <div data-lenis-prevent className="flex flex-1 flex-col justify-center overflow-y-auto px-6 sm:px-8">
          <EmptyState icon={ShoppingBag}>{t("Your bag is empty. Begin with what is new.")}</EmptyState>
        </div>
        <div className="border-t border-line px-6 py-6 sm:px-8">
          <Link className="btn btn--primary btn--block btn--lg" to="/shop/new">{t("Shop new in")}</Link>
        </div>
      </>
    );
  }

  // The live sale price when an offer covers the piece, else the list price.
  const priceOf = (p) => saleOf(p, offers?.sale)?.now ?? p.price;
  // Skip lines whose product is still loading or no longer in the catalogue.
  const rows = lines.map((l) => ({ line: l, product: products.find((p) => p.id === l.productId) })).filter((r) => r.product);
  const subtotal = rows.reduce((sum, r) => sum + priceOf(r.product) * r.line.qty, 0);
  // Hidden (0) until settings load, so the nudge never shows a wrong threshold.
  const threshold = settings?.freeShippingOver ?? 0;
  const left = threshold ? threshold - subtotal : 0;
  const progress = threshold ? Math.min(1, subtotal / threshold) : 0;

  return (
    <>
      <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 sm:px-8">
        {/* Free delivery: a thin line that fills as the bag grows */}
        {threshold > 0 && (
          <div className="border-b border-line py-5">
            <p className="text-[0.88rem] text-ink-2">
              {left > 0 ? <>You are {money(left)} away from free delivery.</> : <span className="font-medium text-success">{t("Free delivery is yours.")}</span>}
            </p>
            <div className="mt-3 h-px w-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={t("Progress to free delivery")}>
              <div className="h-px origin-left bg-brand-grad transition-transform duration-700 ease-q" style={{ transform: `scaleX(${progress})` }} />
            </div>
          </div>
        )}

        {/* Pieces: a photograph, the name and details, a quantity, the price */}
        <ul>
          {rows.map(({ line, product: p }) => (
            <li key={`${p.id}-${line.size}-${line.color}`} className="grid grid-cols-[84px_minmax(0,1fr)] gap-5 border-b border-line py-6">
              <Link to={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-beige">
                <Photo photo={p.photos[0]} label={p.name} />
              </Link>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/product/${p.slug}`} className="font-display text-[1.02rem] leading-snug hover:text-brand-600">{p.name}</Link>
                  <span className="shrink-0 text-[0.92rem] font-semibold tabular-nums">{money(priceOf(p) * line.qty)}</span>
                </div>
                <p className="mt-1 text-[0.84rem] text-ink-3">{line.color}, size {line.size}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center border border-line">
                    <button type="button" className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:bg-ink/5 disabled:opacity-30" aria-label={`Fewer ${p.name}`} disabled={line.qty <= 1} onClick={() => setQty(line, line.qty - 1)}>
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-[0.88rem] tabular-nums" aria-live="polite">{line.qty}</span>
                    <button type="button" className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:bg-ink/5" aria-label={`More ${p.name}`} onClick={() => setQty(line, line.qty + 1)}>
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <button type="button" className="text-[0.84rem] text-ink-3 underline underline-offset-4 transition-colors hover:text-brand-600" onClick={() => remove(line)}>{t("Remove")}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Complete The Look: one outfit around what is in the bag, adding only what is missing */}
        {(() => {
          const inBag = lines.map((l) => l.productId);
          const next = looks.find((o) => o.pieces.some((pc) => !inBag.includes(pc.product.id)));
          if (!next || new Set(inBag).size > 2) return null;
          return (
            <div className="py-7">
              <p className="mb-3 font-display text-[1.15rem]">{t("Complete the look")}</p>
              <OutfitCard outfit={next} skip={inBag} />
            </div>
          );
        })()}
      </div>

      {/* Foot: the subtotal and the way through */}
      <div className="border-t border-line bg-cream px-6 py-6 sm:px-8">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[0.95rem] text-ink-2">{t("Subtotal")}</span>
          <span className="font-display text-[1.4rem] tabular-nums">{money(subtotal)}</span>
        </div>
        <p className="mb-5 text-[0.8rem] text-ink-3">{t("Delivery and any discount are worked out at checkout.")}</p>
        {/* Checkout starts from the full bag page, where sizes and quantities can still change. */}
        <Link className="btn btn--primary btn--block btn--lg" to="/cart">{t("Checkout")}</Link>
        {/* Back to the page they were browsing, with the bag kept */}
        <button type="button" className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 text-[0.9rem] text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline" onClick={closeDrawer}>
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.5} aria-hidden="true" />
          {t("Continue shopping")}
        </button>
      </div>
    </>
  );
}
