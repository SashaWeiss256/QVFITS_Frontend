/* Drawer */
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * A panel from the right for anything with more than a few fields: a
 * product, an order, a customer. The list stays visible behind it, so the
 * admin never loses their place. `footer` holds Save and Cancel.
 */
export default function Drawer({ open, onClose, title, subtitle, footer, wide = false, dismissable = true, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && dismissable && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="scrim is-on" onClick={dismissable ? onClose : undefined} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("absolute inset-y-0 right-0 z-[81] flex w-full flex-col bg-cream shadow-sh-4", wide ? "max-w-3xl" : "max-w-xl")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-white px-6 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-[1.2rem]">{title}</h2>
            {subtitle && <p className="m-0 mt-0.5 text-sm text-ink-3">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={!dismissable} aria-label="Close" className="icon-btn">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-line bg-white px-6 py-4">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
