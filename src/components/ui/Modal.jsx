/* Modal */
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

const SIZES = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

/**
 * Portal dialog on the Quivogue scrim. `dismissable={false}` blocks Escape,
 * the backdrop and the close button while work must not be abandoned.
 */
export default function Modal({ isOpen, onClose, title, size = "md", dismissable = true, footer, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && dismissable && onClose?.();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, dismissable, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="sheet-scrim is-on" onClick={dismissable ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("relative z-[81] flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[22px] border border-line bg-cream shadow-sh-3", SIZES[size])}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id={titleId} className="text-[1.2rem]">{title}</h2>
          <button type="button" onClick={onClose} disabled={!dismissable} aria-label={t("Close")} className="icon-btn">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && <div className="border-t border-line bg-white px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
