/* Search Overlay */
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

import { useProductSearch } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { useFocusReturn, useOverlayFlag } from "../useOverlayFlag";
import SearchOverlayIdle from "./searchOverlay/SearchOverlayIdle";
import SearchOverlayResults from "./searchOverlay/SearchOverlayResults";

/**
 * Search as a sheet from the top: one large field, popular searches and new
 * arrivals before typing, live results with photos from the second letter.
 * Enter opens the full shop results; Escape or the scrim closes it.
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
      <div className={cn("sheet search-ov", open && "is-open")} role="dialog" aria-modal="true" aria-label="Search" inert={!open}>
        <div className="search-ov__inner">
          <form className="search-ov__bar" role="search" onSubmit={submit}>
            <Search className="h-6 w-6 shrink-0 text-ink-3" aria-hidden="true" />
            <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leggings, sets, swim…" aria-label="Search products" autoComplete="off" />
            <button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
          {term.length >= 2 ? <SearchOverlayResults term={term} hits={hits} onNavigate={done} /> : <SearchOverlayIdle onPick={setQ} onNavigate={done} />}
        </div>
      </div>
    </>
  );
}
