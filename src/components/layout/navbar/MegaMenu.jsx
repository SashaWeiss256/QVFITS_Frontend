/* Mega Menu */
import { m } from "motion/react";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import MegaMenuColumn from "./megaMenu/MegaMenuColumn";
import MegaMenuFeature from "./megaMenu/MegaMenuFeature";

/**
 * The full-width "Shop" panel under the header: the columns and links picked
 * in the admin (Catalog, Categories, Menu), then one editorial picture. Cream,
 * airy, a hairline above; it drops open and its columns arrive in a short
 * stagger.
 */
export default function MegaMenu({ id, open, onEnter, onLeave, onNavigate }) {
  const { data: nav } = useNavigation();
  const menu = nav?.shopMenu;

  return (
    <div
      id={id}
      className={cn(
        "absolute inset-x-0 top-full hidden origin-top border-t border-line bg-sand-100 text-ink shadow-[0_30px_60px_-30px_rgb(23_33_31/0.25)] transition-[opacity,transform] duration-400 ease-q lg:block",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Columns of links, then the picture */}
      <m.div
        className="wrap grid gap-12 py-12"
        style={{ gridTemplateColumns: `repeat(${menu?.columns.length || 3}, minmax(0, 1fr)) minmax(0, 1.4fr)` }}
        initial="hidden"
        animate={open ? "shown" : "hidden"}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05 } } }}
      >
        {menu?.columns.map((c) => <MegaMenuColumn key={c.id} title={c.title} links={c.links} onNavigate={onNavigate} />)}
        {menu?.feature && <MegaMenuFeature feature={menu.feature} onNavigate={onNavigate} />}
      </m.div>
    </div>
  );
}
