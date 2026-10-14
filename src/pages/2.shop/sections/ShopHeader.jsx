/* Shop Header */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";

const TITLES = { New: "New in", Bestseller: "Best sellers" };

// Breadcrumb, eyebrow, the page's one h1 and its lede. The title follows the
// filter: a search, a single category, or the New / Best Sellers views.
export default function ShopHeader({ state }) {
  const title = state.query
    ? `Results for “${state.query}”`
    : state.cats.length === 1
      ? state.cats[0]
      : TITLES[state.badge] ?? (state.sale ? "The sale" : "Shop everything");
  useSeo({ title, description: "Every QV FITS piece in the shop right now: seamless and seam-fit activewear, swim and lounge wear." });

  return (
    <>
      <p className="crumbs"><Link to="/">Home</Link> / Shop</p>
      <div className="section-head">
        <span className="kicker">The full range</span>
        <h1 id="shopTitle">{title}</h1>
        <p className="lede">Every piece we have in the shop right now. Sold-out sizes are marked honestly, so there are no surprises at checkout.</p>
      </div>
    </>
  );
}
