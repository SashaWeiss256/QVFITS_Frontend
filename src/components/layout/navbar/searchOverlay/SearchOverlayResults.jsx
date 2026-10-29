/* Search Overlay Results */
import { Link } from "react-router-dom";

import SearchOverlayHit from "./SearchOverlayHit";

// A quick preview of up to eight hits; the full list lives on /shop?q=.
export default function SearchOverlayResults({ term, hits, onNavigate }) {
  if (!hits.length) {
    return <p className="mt-8 text-[1rem] text-ink-3">Nothing matches “{term}”. Try a category: sets, bras, leggings, skorts, swim or lounge.</p>;
  }
  return (
    <div className="mt-8">
      {/* Count, announced as the shopper types */}
      <p className="mb-4 text-[0.8rem] font-medium text-ink-3" aria-live="polite">{hits.length} {hits.length === 1 ? "piece" : "pieces"}</p>

      {/* Hits */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {hits.slice(0, 8).map((p) => <SearchOverlayHit key={p.id} product={p} onNavigate={onNavigate} />)}
      </div>

      {/* All results */}
      <Link className="link-arrow mt-8" to={`/shop?q=${encodeURIComponent(term)}`} onClick={onNavigate}>
        See all results for “{term}”
      </Link>
    </div>
  );
}
