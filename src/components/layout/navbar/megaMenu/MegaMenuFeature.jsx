/* Mega Menu Feature */
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { ArrowRight } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { revealItem } from "@/components/motion/revealVariants";

// One editorial tile: a photo, two lines and a link, set in the dashboard
// (Catalog, Categories, Menu).
export default function MegaMenuFeature({ feature: c, onNavigate }) {
  // An empty div keeps the mega menu grid column when the tile is off.
  if (!c?.live) return <div />;

  return (
    <m.div variants={revealItem}>
      <Link to={c.href} className="mega__feature" onClick={onNavigate}>
        <Photo photo={c.photo} label={c.title} wide />
        <span className="mega__feature-copy">
          <span className="text-[.72rem] font-semibold tracking-[.14em] uppercase opacity-85">{c.kicker}</span>
          <strong>{c.title}</strong>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
            {c.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </m.div>
  );
}
