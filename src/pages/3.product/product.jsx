/* Product Page (port of Quivogue product.html) */
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import RecentlyViewed from "@/components/storefront/RecentlyViewed";
import StyleWith from "@/components/storefront/StyleWith";
import BackLink from "@/components/ui/BackLink";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useRecentlyViewed } from "@/store/context/recentlyViewed";
import { useProductPreview } from "@/store/tanstackStore/queries/admin";
import { useProduct } from "@/store/tanstackStore/queries/site";
import { breadcrumbJsonLd, inStock, productCrumbs, productJsonLd, productMeta, shareImage } from "@/seo/shared";
import { SITE_URL } from "@/seo/site";
import { useSeo } from "@/seo/useSeo";
import Craft from "@/pages/1.home/sections/Craft";
import BuyPanel from "./sections/BuyPanel";
import Gallery from "./sections/Gallery";
import Related from "./sections/Related";
import { t } from "@/i18n/translate";

export default function ProductPage() {
  const { slug } = useParams();
  // ?preview: staff see a draft on the real page; shoppers get the live piece or a 404.
  const [params] = useSearchParams();
  const { admin } = useAdminAuth();
  const previewing = params.has("preview") && Boolean(admin);
  const live = useProduct(previewing ? undefined : slug);
  const draft = useProductPreview(slug, previewing);
  const { data: p, isLoading, error } = previewing ? draft : live;
  // The colour picked in the buy panel; the gallery shows its photos.
  const [colorId, setColorId] = useState(null);
  // Avoid indexing stale product URLs; the title and description follow the loaded piece.
  const { record } = useRecentlyViewed();
  // A draft seen in preview isn't a shopper's visit, so it stays off the list.
  const id = p?.status === "active" ? p.id : undefined;
  useEffect(() => {
    if (id) record(id);
  }, [id, record]);
  // Title, share card (the piece's own photo) and structured data (price, stock, crumbs).
  const meta = p ? productMeta(p) : null;
  useSeo({
    title: meta?.title ?? (error ? "Piece not found" : undefined),
    description: meta?.description,
    image: p ? shareImage(p.photos?.[0], SITE_URL) : undefined,
    imageAlt: p ? `${p.name} by QVFITS` : undefined,
    type: p ? "product" : "website",
    product: p ? { price: p.price, currency: "UGX", inStock: inStock(p) } : undefined,
    jsonLd: p ? [productJsonLd(p, SITE_URL), breadcrumbJsonLd(productCrumbs(p), SITE_URL)] : undefined,
    noindex: Boolean(error) || (p ? p.status !== "active" : false),
  });

  // Keep loading distinct from a missing product so transient fetches don't show a 404.
  if (isLoading) return <PageLoader variant="product" />;
  if (error || !p) {
    return (
      <section className="section section--tight">
        <div className="wrap empty">
          <h1>We can&apos;t find that piece</h1>
          <p className="lede center mt-2">{t("It may have sold out and come off the rail.")}</p>
          <Link className="btn btn--primary mt-4" to="/shop">{t("Back to the shop")}</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="wrap pb-20 pt-8 lg:pb-28 lg:pt-10">
        {previewing && p.status !== "active" && (
          <p role="status" className="mb-6 border-l-2 border-brand-500 bg-brand-50 px-4 py-3 text-sm text-ink-2">
            <strong className="font-semibold">Preview.</strong> This piece is {p.status === "draft" ? "a draft" : "archived"}, so shoppers can&apos;t see it yet. <Link to={`/admin/products/${p.id}`} className="underline">Back to editing</Link>
          </p>
        )}
        {/* Breadcrumb */}
        <p className="crumbs">
          <Link to="/">{t("Home")}</Link> / <Link to="/shop">{t("Shop")}</Link> / <Link to={`/shop/${p.categorySlug}`}>{p.category}</Link> / <span className="text-ink">{p.name}</span>
          <BackLink fallback={`/shop/${p.categorySlug}`} />
        </p>
        {/* The views on the left, the buy panel on the right: two equal halves */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-24">
          <Gallery product={p} colorId={colorId} />
          {/* Reset local size and colour selections when navigating between products. */}
          <BuyPanel key={p.id} product={p} onColor={setColorId} />
        </div>
      </section>
      {/* Outfits built around this piece, with the colours checked */}
      {!previewing && <StyleWith product={p} />}
      <Related product={p} />
      {/* How the pieces are made, once, under the piece */}
      <Craft />
      <RecentlyViewed except={p.id} />
    </>
  );
}
