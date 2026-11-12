/* Filter Sheet */
import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import Button from "@/components/ui/Button";
import { useFocusReturn, useOverlayFlag } from "@/components/layout/useOverlayFlag";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

/**
 * The shell of every filter drawer, in the shop and in the dashboard: from
 * the left on a laptop, a bottom sheet on a phone, a scrolling body of
 * folding sections, and a footer with Clear and "Show N results". Escape
 * closes it, and focus goes back to the button that opened it.
 *
 * The shop's comes in from the left; the dashboard's (`side="right"`) from
 * the right, like its other drawers. Both are a bottom sheet on a phone.
 *
 *   <FilterSheet open onClose title={t("Filter")} count={12} onClear={clear}>
 *     <FilterSection title={t("Category")} picked={2}>…chips…</FilterSection>
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
      <aside
        id={id}
        className={cn(
          "fixed inset-x-0 bottom-0 z-90 flex max-h-[88dvh] flex-col bg-cream shadow-sh-4 transition-[translate,visibility] duration-[550ms] ease-q",
          "md:top-0 md:max-h-none md:w-[min(440px,92vw)]",
          side === "right" ? "md:left-auto" : "md:right-auto",
          open ? "visible translate-none" : cn("invisible translate-y-full md:translate-y-0", side === "right" ? "md:translate-x-full" : "md:-translate-x-full"),
        )} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} inert={!open}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-7 py-5">
          <p id={`${id}-title`} className="m-0 font-display text-xl font-bold tracking-tight">{title}</p>
          <button type="button" className="icon-btn" aria-label="Close filters" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Sections scroll; the header and footer stay put */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-7 pb-6 pt-1">{children}</div>
        {/* Footer: Clear, and a button that shows how many results the filters leave */}
        <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-line bg-cream px-7 pb-5 pt-4">
          <Button variant="ghost" onClick={onClear}>{t("Clear")}</Button>
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
    <div className="border-b border-line">
      <button type="button" className="flex min-h-[60px] w-full items-center gap-2.5 text-left font-display text-[1rem] font-bold tracking-[-0.01em]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {title}
        {picked > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-[0.7rem] font-semibold text-white">{picked}</span>}
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform duration-300 ease-q", !open && "-rotate-90")} aria-hidden="true" />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}
