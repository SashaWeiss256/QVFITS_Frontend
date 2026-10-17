/* Product Page (port of Quivogue product.html) */
import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import RecentlyViewed from "@/components/storefront/RecentlyViewed";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useRecentlyViewed } from "@/store/context/recentlyViewed";
import { useProductPreview } from "@/store/tanstackStore/queries/admin";
import { useProduct } from "@/store/tanstackStore/queries/site";
import { useSeo } from "@/seo/useSeo";
import BuyPanel from "./sections/BuyPanel";
import Gallery from "./sections/Gallery";
import Related from "./sections/Related";

export default function ProductPage() {
  const { slug } = useParams();
  // ?preview: staff see a draft on the real page; shoppers get the live piece or a 404.
  const [params] = useSearchParams();
  const { admin } = useAdminAuth();
  const previewing = params.has("preview") && Boolean(admin);
  const live = useProduct(previewing ? undefined : slug);
  const draft = useProductPreview(slug, previewing);
  const { data: p, isLoading, error } = previewing ? draft : live;
  // Avoid indexing stale product URLs; the title and description follow the loaded piece.
  const { record } = useRecentlyViewed();
  // A draft seen in preview isn't a shopper's visit, so it stays off the list.
  const id = p?.status === "active" ? p.id : undefined;
  useEffect(() => {
    if (id) record(id);
  }, [id, record]);
  useSeo({ title: p?.name ?? (error ? "Piece not found" : undefined), description: p ? `${p.name}, ${p.category} from QVFITS, Kampala. ${p.blurb}` : undefined, noindex: Boolean(error) });

  // Keep loading distinct from a missing product so transient fetches don't show a 404.
  if (isLoading) return <PageLoader />;
  if (error || !p) {
    return (
      <section className="section section--tight">
        <div className="wrap empty">
          <h1>We can&apos;t find that piece</h1>
          <p className="lede center mt-2">It may have sold out and come off the rail.</p>
          <Link className="btn btn--primary mt-4" to="/shop">Back to the shop</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          {previewing && p.status !== "active" && (
            <p role="status" className="mb-4 rounded-r-md border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-ink-2">
              <strong className="font-semibold">Preview.</strong> This piece is {p.status === "draft" ? "a draft" : "archived"}, so shoppers can&apos;t see it yet. <Link to={`/admin/products/${p.id}`} className="underline">Back to editing</Link>
            </p>
          )}
          <p className="crumbs">
            <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop/${p.categorySlug}`}>{p.category}</Link> / {p.name}
          </p>
          <div className="pdp">
            <Gallery product={p} />
            {/* Reset local size and colour selections when navigating between products. */}
            <BuyPanel key={p.id} product={p} />
          </div>
        </div>
      </section>
      <Related product={p} />
      <RecentlyViewed except={p.id} />
    </>
  );
}
