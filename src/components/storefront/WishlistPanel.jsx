/* Wishlist Panel */
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { useProductsByIds } from "@/store/tanstackStore/queries/site";
import Photo from "./Photo";

export default function WishlistPanel() {
  const { ids, toggle } = useWishlist();
  const { money } = useCurrency();
  const { data: products = [] } = useProductsByIds(ids);

  if (!ids.length) {
    return (
      <>
        <div className="drawer__body">
          <EmptyState icon={Heart}>Nothing saved yet. Tap the heart on anything you love.</EmptyState>
        </div>
        <div className="drawer__foot">
          <Link className="btn btn--primary btn--block" to="/shop">Start browsing</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="drawer__body">
        {products.map((p) => (
          <div key={p.id} className="mini-row">
            <Link className="mini-row__media" to={`/product/${p.slug}`}><Photo photo={p.photos[0]} label={p.name} /></Link>
            <div>
              <strong>{p.name}</strong>
              <small>{money(p.price)}</small>
            </div>
            <button type="button" className="icon-btn" aria-label={`Remove ${p.name} from wishlist`} onClick={() => toggle(p.id)}>
              <X className="h-[19px] w-[19px]" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <div className="drawer__foot">
        <Link className="btn btn--primary btn--block" to="/shop">Keep shopping</Link>
      </div>
    </>
  );
}
