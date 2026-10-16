/* Overlay Flag */
import { useEffect } from "react";

let open = 0;

/**
 * While any drawer, menu or overlay is open, marks <body data-overlay> so
 * the floating helpers (Vee, the offer sticker) step back, and the page
 * behind stops scrolling. Counted, so two overlays never fight.
 */
export function useOverlayFlag(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined;
    open += 1;
    document.body.dataset.overlay = String(open);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      open -= 1;
      if (open <= 0) {
        open = 0;
        delete document.body.dataset.overlay;
        document.body.style.overflow = overflow;
      } else document.body.dataset.overlay = String(open);
    };
  }, [isOpen]);
}

/** Puts focus back on whatever opened an overlay, once it closes. */
export function useFocusReturn(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    return () => opener?.focus?.({ preventScroll: true });
  }, [isOpen]);
}
