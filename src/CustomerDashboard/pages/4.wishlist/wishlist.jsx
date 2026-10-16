/* Account Saved Pieces */
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import ProductGrid from "@/components/storefront/ProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import { useWishlist } from "@/store/context/WishlistContext";
import { useProductsByIds } from "@/store/tanstackStore/queries/site";

// The same list as the heart in the navbar: WishlistContext merges the device's
// guest list into the account on sign in.
export default function AccountWishlist() {
  const { ids } = useWishlist();
  const { data: products = [] } = useProductsByIds(ids);

  // Check the ids, not the products, so the empty state doesn't flash while they load.
  if (!ids.length) {
    return <EmptyState icon={Heart} action={<Link to="/shop" className="btn btn--primary">Start browsing</Link>}>Nothing saved yet. Tap the heart on anything you love.</EmptyState>;
  }
  return (
    <>
      <h2 className="sr-only">Saved pieces</h2>
      <ProductGrid products={products} />
    </>
  );
}
