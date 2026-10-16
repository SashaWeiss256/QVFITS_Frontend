/* Shop Header */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import { fill } from "@/utils/fill";

// Breadcrumb, eyebrow, the page's one h1 and its lede. The title follows the
// filter: a search, a single category, or the New / Best Sellers views.
export default function ShopHeader({ state }) {
  const { data: copy } = usePageCopy("shop");
  const t = copy?.titles ?? {};
  const title = state.query
    ? fill(t.search, { query: state.query })
    : state.cats.length === 1
      ? state.cats[0]
      : t[state.badge] ?? (state.sale ? t.sale : t.all) ?? "";
  useSeo({ title, description: copy?.seo });

  return (
    <>
      <p className="crumbs"><Link to="/">Home</Link> / Shop</p>
      <div className="section-head">
        <span className="kicker">{copy?.kicker}</span>
        <h1 id="shopTitle">{title}</h1>
        <p className="lede">{copy?.lede}</p>
      </div>
    </>
  );
}
