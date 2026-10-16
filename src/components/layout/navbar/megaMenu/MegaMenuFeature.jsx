/* Mega Menu Feature */
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { ArrowRight } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { revealItem } from "@/components/motion/revealVariants";
import { useHomeContent } from "@/store/tanstackStore/queries/site";

// One editorial tile: the live campaign from the admin's Website module.
export default function MegaMenuFeature({ onNavigate }) {
  const { data: content } = useHomeContent();
  const c = content?.campaign;
  // An empty div keeps the mega menu grid column when no campaign is live.
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
