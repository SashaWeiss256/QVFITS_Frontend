/* Mobile Menu Shop */
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import { useFacets, useNavigation } from "@/store/tanstackStore/queries/site";

// "Shop" opens in place: the edits, every category, every activity.
export default function MobileMenuShop() {
  const [open, setOpen] = useState(false);
  const { data: facets } = useFacets();
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
          {/* Edits first, then categories and activities from the live catalogue facets. */}
          {nav?.shopEdits.map((l) => <Link key={l.path} to={l.path}>{l.title}</Link>)}
          {facets?.categories.map((c) => <Link key={c} to={`/shop?c=${encodeURIComponent(c)}`}>{c}</Link>)}
          {facets?.occasions.map((o) => <Link key={o.id} to={`/shop?occasion=${o.id}`}>{o.label}</Link>)}
        </div>
      )}
    </div>
  );
}
