/* Product Picker */
import { useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";

import { matchesSearch } from "@/utils/search";
import Photo from "@/components/storefront/Photo";

/**
 * An ordered list of products picked by name: a home rail, a kit, the
 * products a discount covers. Search adds; arrows reorder; the cross removes.
 */
export default function ProductPicker({ products, value = [], onChange, max, ordered = true }) {
  const [q, setQ] = useState("");
  // The chosen pieces in the order picked; one that has since been deleted is skipped.
  const picked = value.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  // Suggestions start at two letters, and leave out pieces already chosen.
  const matches = q.trim().length < 2 ? [] : products.filter((p) => !value.includes(p.id) && matchesSearch(`${p.name} ${p.category ?? ""}`, q.trim())).slice(0, 6);
  // A limit (a kit holds six) stops more being added.
  const full = max && value.length >= max;

  const move = (i, by) => {
    const next = [...value];
    const [id] = next.splice(i, 1);
    next.splice(i + by, 0, id);
    onChange(next);
  };

  return (
    <div>
      {/* Chosen Pieces: a draft or archived piece is flagged, because it can't be sold yet */}
      <ul className="m-0 mb-3 grid list-none gap-2 p-0">
        {picked.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-2">
            <span className="block h-12 w-9 flex-none overflow-hidden rounded-[10px] bg-sand-100">{p.photos[0] && <Photo photo={p.photos[0]} label={p.name} className="h-full rounded-none" />}</span>
            <span className="flex-1 text-sm"><strong>{p.name}</strong>{p.status !== "active" && <span className="ml-2 text-xs text-warn">({p.status}, not shown)</span>}</span>
            {ordered && (
              <>
                <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className="icon-btn" aria-label="Move down" disabled={i === picked.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
              </>
            )}
            <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => onChange(value.filter((x) => x !== p.id))}><X className="h-4 w-4" /></button>
          </li>
        ))}
        {!picked.length && <li className="text-sm text-ink-3">Nothing picked yet.</li>}
      </ul>
      {/* Search: type a name to add another */}
      {!full && (
        <div className="relative">
          <input className="input w-full rounded-r-pill px-5" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a product name to add it" aria-label="Find a product to add" />
          {matches.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full list-none rounded-[14px] border border-line bg-white p-1 shadow-sh-3">
              {matches.map((p) => (
                <li key={p.id}>
                  <button type="button" className="w-full rounded-[10px] px-3 py-2 text-left text-sm hover:bg-brand-50" onClick={() => { onChange([...value, p.id]); setQ(""); }}>
                    {p.name} <span className="text-ink-3">· {p.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {full && <p className="m-0 text-xs text-ink-3">The rail holds {max}. Remove one to add another.</p>}
    </div>
  );
}
