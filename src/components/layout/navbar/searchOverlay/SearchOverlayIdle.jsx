/* Search Overlay Idle */
import { useNavigation, useProductsByIds, useRails } from "@/store/tanstackStore/queries/site";
import SearchOverlayHit from "./SearchOverlayHit";

// Before anything is typed: popular searches and what just landed.
export default function SearchOverlayIdle({ onPick, onNavigate }) {
  const { data: rails } = useRails();
  const { data: nav } = useNavigation();
  const { data: newIn = [] } = useProductsByIds(rails?.newReleases ?? []);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_3fr]">
      {/* Popular searches */}
      <div>
        <p className="mb-4 text-[0.8rem] font-medium text-ink-3">Popular searches</p>
        <ul className="space-y-2">
          {nav?.popularSearches.map((t) => (
            <li key={t}>
              <button type="button" className="font-display text-[1.25rem] text-ink-2 transition-colors hover:text-brand-600" onClick={() => onPick(t)}>{t}</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Just landed */}
      {newIn.length > 0 && (
        <div>
          <p className="mb-4 text-[0.8rem] font-medium text-ink-3">Just landed</p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {newIn.slice(0, 4).map((p) => <SearchOverlayHit key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </div>
      )}
    </div>
  );
}
