/* Mega Menu */
import { m } from "motion/react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useFacets, useNavigation, useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import MegaMenuColumn from "./megaMenu/MegaMenuColumn";
import MegaMenuFeature from "./megaMenu/MegaMenuFeature";

/**
 * The full-width "Shop" panel under the header: categories, activities,
 * curated edits and help, and the live campaign. Its columns arrive in a
 * short stagger each time it opens.
 */
export default function MegaMenu({ id, open, onEnter, onLeave, onNavigate }) {
  const { data: facets } = useFacets();
  const { data: settings } = useSettings();
  const { data: nav } = useNavigation();
  const { money } = useCurrency();

  const categories = (facets?.categories ?? []).map((c) => ({ title: c, path: `/shop?c=${encodeURIComponent(c)}` }));
  const activities = (facets?.occasions ?? []).map((o) => ({ title: o.label, path: `/shop?occasion=${o.id}` }));

  return (
    <div id={id} className={cn("mega", open && "is-open")} onMouseEnter={onEnter} onMouseLeave={onLeave} aria-hidden={!open} inert={!open}>
      <m.div className="mega__inner" initial="hidden" animate={open ? "shown" : "hidden"} variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05 } } }}>
        <MegaMenuColumn title="Category" links={categories} onNavigate={onNavigate} />
        <MegaMenuColumn title="Activity" links={activities} onNavigate={onNavigate} />
        <MegaMenuColumn title="Edits" links={[...(nav?.shopEdits ?? []), ...(nav?.help.slice(0, 1) ?? [])]} onNavigate={onNavigate} />
        <MegaMenuFeature onNavigate={onNavigate} />
      </m.div>
      <div className="mega__foot">
        <span>{settings ? `Free delivery over ${money(settings.freeShippingOver)} · Showroom at ${settings.address}` : ""}</span>
      </div>
    </div>
  );
}
