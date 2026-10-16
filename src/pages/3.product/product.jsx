/* Product Page (port of Quivogue product.html) */
import { Link, useParams } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useProduct } from "@/store/tanstackStore/queries/site";
import { useSeo } from "@/seo/useSeo";
import BuyPanel from "./sections/productBuyPanel/BuyPanel";
import ProductGallery from "./sections/productGallery/ProductGallery";
import Related from "./sections/Related";

export default function ProductPage() {
  const { slug } = useParams();
  const { data: p, isLoading, error } = useProduct(slug);
  useSeo({ title: p?.name ?? (error ? "Piece not found" : undefined), description: p ? `${p.name}, ${p.category} from QV FITS, Kampala. ${p.blurb}` : undefined, noindex: Boolean(error) });

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
          <p className="crumbs">
            <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?c=${encodeURIComponent(p.category)}`}>{p.category}</Link> / {p.name}
          </p>
          <div className="pdp">
            <ProductGallery product={p} />
            <BuyPanel key={p.id} product={p} />
          </div>
        </div>
      </section>
      <Related product={p} />
    </>
  );
}
