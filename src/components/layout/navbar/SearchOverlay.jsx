/* Search Overlay */
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

import { useProductSearch } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { useFocusReturn, useOverlayFlag } from "../useOverlayFlag";
import SearchOverlayIdle from "./searchOverlay/SearchOverlayIdle";
import SearchOverlayResults from "./searchOverlay/SearchOverlayResults";
import { t } from "@/i18n/translate";

/**
 * Search as a cream sheet from the top: one large serif field on a hairline,
 * popular searches and new arrivals before typing, live results with photos
 * from the second letter. Enter opens the full shop results; Escape or the
 * scrim closes it.
 */
export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const term = useDeferredValue(q.trim());
  const input = useRef(null);
  const navigate = useNavigate();
  const { data: hits = [] } = useProductSearch(term);
  useOverlayFlag(open);
  useFocusReturn(open);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => input.current?.focus(), 80);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const done = () => {
    setQ("");
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!term) return;
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    done();
  };

  return (
    <>
      <div className={cn("sheet-scrim", open && "is-on")} onClick={onClose} />
      <div
        data-lenis-prevent
        className={cn(
          "fixed inset-x-0 top-0 z-90 max-h-[88vh] overflow-y-auto bg-sand-100 text-ink transition-[transform,visibility] duration-500 ease-q",
          // Hidden as well as moved up when closed, so no edge of it can show.
          open ? "visible translate-y-0" : "invisible -translate-y-[110%]",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t("Search")}
        inert={!open}
      >
        <div className="wrap pb-12 pt-8 lg:pt-12">
          {/* Field */}
          <form className="flex items-center gap-4 border-b border-ink pb-4" role="search" onSubmit={submit}>
            <Search className="h-6 w-6 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search leggings, sets, swim")}
              aria-label="Search products"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight outline-none placeholder:text-ink-4/70"
            />
            <button type="button" className="icon-btn -mr-2.5" aria-label={t("Close search")} onClick={onClose}>
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </form>

          {/* Suggestions before typing, results after */}
          {term.length >= 2 ? <SearchOverlayResults term={term} hits={hits} onNavigate={done} /> : <SearchOverlayIdle onPick={setQ} onNavigate={done} />}
        </div>
      </div>
    </>
  );
}
