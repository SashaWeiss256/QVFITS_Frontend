/* Mega Menu */
import { m } from "motion/react";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import MegaMenuColumn from "./megaMenu/MegaMenuColumn";
import MegaMenuFeature from "./megaMenu/MegaMenuFeature";

/**
 * The full-width "Shop" panel under the header: the columns and links picked
 * in the admin (Catalog, Categories, Menu), then the picture tile. Delivery and
 * showroom details are not repeated here (the top bar and footer carry them).
 * Its columns arrive in a short stagger each time it opens.
 */
export default function MegaMenu({ id, open, onEnter, onLeave, onNavigate }) {
  const { data: nav } = useNavigation();
  const menu = nav?.shopMenu;

  return (
    <div id={id} className={cn("mega", open && "is-open")} onMouseEnter={onEnter} onMouseLeave={onLeave} aria-hidden={!open} inert={!open}>
      <m.div className="mega__inner" style={{ "--cols": menu?.columns.length || 3 }} initial="hidden" animate={open ? "shown" : "hidden"} variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05 } } }}>
        {menu?.columns.map((c) => <MegaMenuColumn key={c.id} title={c.title} links={c.links} onNavigate={onNavigate} />)}
        {menu?.feature && <MegaMenuFeature feature={menu.feature} onNavigate={onNavigate} />}
      </m.div>
    </div>
  );
}
