/* Filter Sheet */
import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import Button from "@/components/ui/Button";
import { useFocusReturn, useOverlayFlag } from "@/components/layout/useOverlayFlag";
import { cn } from "@/utils/cn";

/**
 * The shell of every filter drawer, in the shop and in the dashboard: from
 * the left on a laptop, a bottom sheet on a phone, a scrolling body of
 * folding sections, and a footer with Clear and "Show N results". Escape
 * closes it, and focus goes back to the button that opened it.
 *
 * The shop's comes in from the left; the dashboard's (`side="right"`) from
 * the right, like its other drawers. Both are a bottom sheet on a phone.
 *
 *   <FilterSheet open onClose title="Filter" count={12} onClear={clear}>
 *     <FilterSection title="Category" picked={2}>…chips…</FilterSection>
 *   </FilterSheet>
 */
export default function FilterSheet({ open, onClose, id = "filters", title = "Filter", count, onClear, side = "left", children }) {
  // While open, the page behind stops scrolling and floating buttons (Vee, the offer sticker) step aside.
  useOverlayFlag(open);
  useFocusReturn(open);

  // Escape closes the sheet.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim: tapping outside closes it */}
      <div className={cn("sheet-scrim", open && "is-on")} onClick={onClose} />
      <aside id={id} className={cn("sheet fdrawer", side === "right" && "fdrawer--right", open && "is-open")} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} inert={!open}>
        {/* Header */}
        <div className="fdrawer__head">
          <p id={`${id}-title`} className="m-0 font-display text-xl font-bold tracking-tight">{title}</p>
          <button type="button" className="icon-btn" aria-label="Close filters" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Sections scroll; the header and footer stay put */}
        <div className="fdrawer__body">{children}</div>
        {/* Footer: Clear, and a button that shows how many results the filters leave */}
        <div className="fdrawer__foot">
          <Button variant="ghost" onClick={onClear}>Clear</Button>
          <Button block onClick={onClose}>Show {count} {count === 1 ? "result" : "results"}</Button>
        </div>
      </aside>
    </>
  );
}

/** One folding section of a filter sheet, with how many of its options are ticked. */
export function FilterSection({ title, picked = 0, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="fgroup">
      <button type="button" className="fgroup__head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        {picked > 0 && <span className="fgroup__on">{picked}</span>}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && <div className="fgroup__body">{children}</div>}
    </div>
  );
}
