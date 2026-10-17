/* Mobile Menu Shop */
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import { useNavigation } from "@/store/tanstackStore/queries/site";

// "Shop" opens in place, with the same columns as the desktop mega menu.
export default function MobileMenuShop() {
  const [open, setOpen] = useState(false);
  const { data: nav } = useNavigation();
  const id = useId();

  return (
    <div>
      <button type="button" className="mmenu__link" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        Shop
        {open ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
      </button>
      {open && (
        <div id={id} className="mmenu__sub">
          {nav?.shopMenu.columns.map((c) => (
            <div key={c.id} className="col-span-2 grid grid-cols-2 gap-x-4">
              <p className="col-span-2 m-0 mt-3 text-[.72rem] font-semibold tracking-[.14em] text-ink-3 uppercase">{c.title}</p>
              {c.links.map((l) => <Link key={l.id} to={l.href}>{l.title}</Link>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
