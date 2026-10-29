/* Shop Header */
import { Link } from "react-router-dom";

import { PAGES, breadcrumbJsonLd } from "@/seo/shared";
import { SITE_URL } from "@/seo/site";
import { useSeo } from "@/seo/useSeo";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import { fill } from "@/utils/fill";
import { targetHref, targetLabel } from "@/utils/shopTargets";
import { t } from "@/i18n/translate";

// Breadcrumb, eyebrow, the page's one h1 and its lede. The title follows the
// address: a search, a part of the shop (Bras, Pilates, Bras for running),
// or the New in / Best sellers / Sale views. One category or one term on its
// own uses the description written for it in the admin.
export default function ShopHeader({ state, lookup }) {
  const { data: copy } = usePageCopy("shop");
  const titles = copy?.titles ?? {};
  const scope = { categories: state.cats, terms: state.terms };
  const scoped = Boolean(lookup && (state.cats.length || state.terms.length));
  const only =
    state.cats.length + state.terms.length === 1
      ? lookup?.categories.find((c) => c.id === state.cats[0]) ?? lookup?.terms.find((t) => t.id === state.terms[0])
      : null;

  // One Edit on its own names the page (New in, The sale, Shop the kit).
  const alone = state.labels.length === 1 ? state.labels[0] : null;
  const LABEL_TITLE = { new: titles.New, bestseller: titles.Bestseller, sale: titles.sale, kits: copy?.kits.title };
  const title = state.query
    ? fill(titles.search, { query: state.query })
    : scoped
      ? targetLabel({ ...scope, label: alone ?? undefined }, lookup)
      : (alone && LABEL_TITLE[alone]) || titles.all || "";
  const lede = alone === "kits" && !scoped ? copy?.kits.lede : only?.description || copy?.lede;
  // A search is a private view, so it stays out of results; every other view is a page of its own.
  const description = only?.description || copy?.seo || (scoped || alone ? `${title} from QVFITS, Kampala. ${PAGES.shop.description}` : PAGES.shop.description);
  const crumbJson = [{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, ...(scoped || alone ? [{ name: title, path: window.location.pathname }] : [])];
  useSeo({
    title: title || PAGES.shop.title,
    description,
    noindex: Boolean(state.query),
    jsonLd: breadcrumbJsonLd(crumbJson, SITE_URL),
  });

  // Home / Shop / Bras / Running: each step links to the wider view.
  const crumbs = [];
  if (scoped && state.cats.length && state.terms.length) {
    crumbs.push({ label: targetLabel({ categories: state.cats }, lookup), to: targetHref({ categories: state.cats }, lookup) });
  }

  return (
    <header className="mb-10 lg:mb-14">
      {/* Breadcrumb */}
      <p className="crumbs">
        <Link to="/">{t("Home")}</Link> / {scoped || state.labels.length || state.query ? <Link to="/shop">{t("Shop")}</Link> : "Shop"}
        {crumbs.map((c) => (
          <span key={c.to}> / <Link to={c.to}>{c.label}</Link></span>
        ))}
        {scoped && <> / {title}</>}
      </p>
      {/* Title on the left, its line on the right */}
      <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="kicker">{scoped ? "Shop" : copy?.kicker}</p>
          <h1 id="shopTitle">{title}</h1>
        </div>
        {lede && <p className="max-w-md text-[1rem] leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:justify-self-end">{lede}</p>}
      </div>
    </header>
  );
}
