/* Mega Menu Feature */
import { Link } from "react-router-dom";
import { m } from "motion/react";

import Photo from "@/components/storefront/Photo";
import { revealItem } from "@/components/motion/revealVariants";

// One editorial picture: a photo, two lines and a link, set in the dashboard
// (Catalog, Categories, Menu). The photo eases in on hover.
export default function MegaMenuFeature({ feature: c, onNavigate }) {
  // An empty div keeps the mega menu grid column when the tile is off.
  if (!c?.live) return <div />;

  return (
    <m.div variants={revealItem}>
      <Link to={c.href} className="group relative block aspect-[16/10] overflow-hidden" onClick={onNavigate}>
        {/* Picture */}
        <Photo photo={c.photo} label={c.title} wide className="transition-transform duration-[1.2s] ease-q group-hover:scale-[1.04]" />

        {/* Copy over a soft shade */}
        <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" aria-hidden="true" />
        <span className="absolute inset-x-6 bottom-6 flex flex-col gap-1.5 text-cream">
          <span className="text-[0.8rem] font-medium text-cream/85">{c.kicker}</span>
          <strong className="font-display text-[1.6rem] font-normal leading-tight">{c.title}</strong>
          <span className="mt-1 text-[0.85rem] font-medium underline decoration-cream/50 underline-offset-[6px]">{c.cta}</span>
        </span>
      </Link>
    </m.div>
  );
}
