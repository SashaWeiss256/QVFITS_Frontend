/* Search Overlay Idle */
import { useNavigation, useProductsByIds, useRails } from "@/store/tanstackStore/queries/site";
import SearchOverlayHit from "./SearchOverlayHit";

// Before anything is typed: popular searches and what just landed.
export default function SearchOverlayIdle({ onPick, onNavigate }) {
  const { data: rails } = useRails();
  const { data: nav } = useNavigation();
  const { data: newIn = [] } = useProductsByIds(rails?.newReleases ?? []);

  return (
    <>
      <p className="search-ov__label">Popular</p>
      <div className="search-ov__chips">
        {nav?.popularSearches.map((t) => (
          <button key={t} type="button" className="chip" onClick={() => onPick(t)}>{t}</button>
        ))}
      </div>
      {newIn.length > 0 && (
        <>
          <p className="search-ov__label">Just landed</p>
          <div className="search-ov__grid">
            {newIn.slice(0, 4).map((p) => <SearchOverlayHit key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </>
      )}
    </>
  );
}
