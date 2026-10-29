/* Mobile Menu Shop */
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";

import { useNavigation } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// "Shop" opens in place with the same groups as the desktop mega menu: a
// title per group. Pieces and movements are soft pills; the last group (the
// edits) is a pair of roomy tiles.
export default function MobileMenuShop() {
  const [open, setOpen] = useState(false);
  const { data: nav } = useNavigation();
  const id = useId();

  return (
    <div className="border-b border-line">
      {/* Toggle */}
      <button type="button" className="flex min-h-14 w-full items-center justify-between font-display text-[1.6rem] leading-none" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {t("Shop")}
        <Plus className={cn("h-5 w-5 transition-transform duration-500 ease-q", open && "rotate-45")} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Groups and their links: pieces as soft pills, the edits as roomy tiles */}
      {open && (
        <div id={id} className="mb-5 mt-1 space-y-6 rounded-[22px] border border-line bg-sand-100/70 p-4 pb-5">
          {nav?.shopMenu.columns.map((c, n) => {
            const tiles = n === (nav.shopMenu.columns.length - 1) && c.links.length > 3;
            return (
              <section key={c.id} aria-label={c.title}>
                <h3 className="mb-3 font-display text-[1.05rem] font-medium tracking-[-0.005em] text-ink">{c.title}</h3>
                {tiles ? (
                  <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0">
                    {c.links.map((l) => (
                      <li key={l.id}>
                        <Link to={l.href} className="flex min-h-[52px] items-center justify-between gap-2 rounded-[16px] border border-line bg-white px-4 text-[0.92rem] text-ink shadow-[0_1px_2px_rgb(23_33_31/0.05),0_6px_14px_rgb(23_33_31/0.06)] transition-[box-shadow,color] duration-200 hover:text-brand-600">
                          <span className="leading-tight">{l.title}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-4" strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {c.links.map((l) => (
                      <li key={l.id}>
                        <Link to={l.href} className="chip chip--raised min-h-10 px-4 text-[0.9rem] text-ink hover:text-brand-600">{l.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
