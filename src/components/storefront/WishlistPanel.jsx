/* Wishlist Panel */
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { useProductsByIds } from "@/store/tanstackStore/queries/site";
import Photo from "./Photo";
import { t } from "@/i18n/translate";

// The saved pieces drawer. Removing here un-hearts the piece everywhere.
export default function WishlistPanel() {
  const { ids, toggle } = useWishlist();
  const { money } = useCurrency();
  // The saved pieces, read from the shop so prices and names are current.
  const { data: products = [] } = useProductsByIds(ids);

  // Nothing saved yet: a gentle empty state with a way into the shop.
  if (!ids.length) {
    return (
      <>
        <div data-lenis-prevent className="flex flex-1 flex-col justify-center overflow-y-auto px-6 sm:px-8">
          {/* Empty State */}
          <EmptyState icon={Heart}>{t("Nothing saved yet. Tap the heart on anything you love.")}</EmptyState>
        </div>
        <div className="border-t border-line px-6 py-6 sm:px-8">
          <Link className="btn btn--primary btn--block btn--lg" to="/shop">{t("Start browsing")}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 sm:px-8">
        {/* Saved Pieces: each links to its page and can be removed */}
        <ul>
          {products.map((p) => (
            <li key={p.id} className="grid grid-cols-[84px_minmax(0,1fr)] gap-5 border-b border-line py-6">
              <Link to={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-beige">
                <Photo photo={p.photos[0]} label={p.name} />
              </Link>
              <div className="flex min-w-0 flex-col">
                <Link to={`/product/${p.slug}`} className="font-display text-[1.02rem] leading-snug hover:text-brand-600">{p.name}</Link>
                <p className="mt-1 text-[0.92rem] tabular-nums text-ink-2">{money(p.price)}</p>
                <div className="mt-auto flex items-center gap-6 pt-4 text-[0.84rem]">
                  <Link to={`/product/${p.slug}`} className="underline underline-offset-4 transition-colors hover:text-brand-600">{t("Choose size")}</Link>
                  <button type="button" className="text-ink-3 underline underline-offset-4 transition-colors hover:text-brand-600" aria-label={`Remove ${p.name} from saved pieces`} onClick={() => toggle(p.id)}>{t("Remove")}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-line px-6 py-6 sm:px-8">
        <Link className="btn btn--primary btn--block btn--lg" to="/shop">{t("Keep shopping")}</Link>
      </div>
    </>
  );
}
