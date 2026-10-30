/* Lightbox */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useFocusReturn, useOverlayFlag } from "@/components/layout/useOverlayFlag";
import { photoSources } from "@/utils/media";
import { t } from "@/i18n/translate";

/**
 * One view of the piece, large and quiet on the page's own colour. Arrows,
 * the arrow keys or a swipe move between views; Escape, the close button or
 * a tap on the empty space closes it. The page behind stops scrolling and
 * focus goes back to where it was.
 */
export default function Lightbox({ views, at, name, onStep, onClose }) {
  useOverlayFlag(true);
  useFocusReturn(true);
  const closeRef = useRef(null);
  const swipe = useRef(null);
  const view = views[at];
  const many = views.length > 1;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (many && e.key === "ArrowRight") onStep(1);
      if (many && e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [many, onClose, onStep]);

  const src = view ? photoSources(view, { wide: true }) : null;
  const ARROW = "pointer-events-auto grid h-12 w-12 place-items-center rounded-full text-ink transition-colors hover:bg-ink/10";

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[95] flex flex-col bg-sand-100 text-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`${name}, view ${at + 1} of ${views.length}`}
    >
      {/* Top: the count and close */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
        <span className="text-[0.85rem] tabular-nums text-ink-3" aria-live="polite">{many ? `${at + 1} / ${views.length}` : ""}</span>
        <button ref={closeRef} type="button" className="icon-btn -mr-2.5" aria-label={t("Close")} onClick={onClose}>
          <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* The view: as large as the screen allows, never cropped */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-20 sm:pb-8"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onPointerDown={(e) => (swipe.current = e.pointerType === "mouse" ? null : e.clientX)}
        onPointerUp={(e) => {
          if (swipe.current === null || !many) return;
          const dx = e.clientX - swipe.current;
          if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
          swipe.current = null;
        }}
      >
        {src && (
          <picture className="contents">
            {!src.remote && <source type="image/webp" srcSet={src.srcSet} sizes="100vw" />}
            <img
              key={view.id}
              className="max-h-full max-w-full select-none object-contain animate-fade-up"
              src={src.src}
              srcSet={src.remote ? src.srcSet : undefined}
              sizes={src.remote ? "100vw" : undefined}
              alt={name}
              draggable={false}
            />
          </picture>
        )}
        {many && (
          <div className="pointer-events-none absolute inset-x-2 top-1/2 hidden -translate-y-1/2 justify-between sm:flex sm:inset-x-6">
            <button type="button" className={ARROW} aria-label="Previous view" onClick={() => onStep(-1)}><ChevronLeft className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" /></button>
            <button type="button" className={ARROW} aria-label="Next view" onClick={() => onStep(1)}><ChevronRight className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" /></button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
