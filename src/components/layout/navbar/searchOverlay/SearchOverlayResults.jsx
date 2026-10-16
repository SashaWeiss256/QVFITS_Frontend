/* Search Overlay Results */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SearchOverlayHit from "./SearchOverlayHit";

// A quick preview of up to eight hits; the full list lives on /shop?q=.
export default function SearchOverlayResults({ term, hits, onNavigate }) {
  if (!hits.length) {
    return <p className="mt-6 text-ink-3">Nothing matches “{term}”. Try a category: sets, bras, leggings, skorts, swim, lounge.</p>;
  }
  return (
    <>
      {/* Announce the count as the shopper types. */}
      <p className="search-ov__label" aria-live="polite">{hits.length} {hits.length === 1 ? "piece" : "pieces"}</p>
      <div className="search-ov__grid">
        {hits.slice(0, 8).map((p) => <SearchOverlayHit key={p.id} product={p} onNavigate={onNavigate} />)}
      </div>
      <Link className="link-arrow mt-6 inline-flex min-h-11 items-center gap-1.5" to={`/shop?q=${encodeURIComponent(term)}`} onClick={onNavigate}>
        See all results for “{term}” <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </>
  );
}
