/* Search (from Quivogue wireSearch()) */
import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useProductSearch } from "@/store/tanstackStore/queries/site";
import { anyInStock } from "@/utils/stockLevel";

/**
 * One field for both layouts: inline on desktop; on a phone it wraps onto its
 * own row when the header's search icon is tapped. Results drop down under
 * the header from the second letter. A render prop, because the field sits
 * in the header row while the results span the whole header beneath it.
 */
export default function SearchPanel({ inputRef, onDone, children }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const term = useDeferredValue(q.trim());
  const navigate = useNavigate();
  const { money } = useCurrency();
  const { data: hits = [] } = useProductSearch(term);

  const showing = open && term.length >= 2;
  const close = () => setOpen(false);
  const finish = () => {
    setQ("");
    close();
    onDone?.();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!term) return;
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    finish();
  };

  const form = (
    <form className="search__field" role="search" autoComplete="off" onSubmit={submit}>
      <span className="search__icon">
        <Search className="h-[19px] w-[19px]" aria-hidden="true" />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={q}
        placeholder="Search leggings, swim, skorts…"
        aria-label="Search products"
        aria-controls="searchResults"
        aria-expanded={showing}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(close, 150)}
        onKeyDown={(e) => e.key === "Escape" && (close(), e.currentTarget.blur())}
      />
      {q && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={() => setQ("")}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );

  const results = (
    <div className="search__results" id="searchResults" hidden={!showing}>
      {hits.length === 0 ? (
        <div className="search__empty">Nothing matches “{term}”. Try a category: sets, bras, leggings, skorts, swim, lounge.</div>
      ) : (
        <>
          <div className="search__list">
            {hits.slice(0, 6).map((p) => (
              <Link key={p.id} className="search__hit" to={`/product/${p.slug}`} onClick={finish}>
                <span className="search__thumb">
                  <Photo photo={p.photos[0]} label={p.name} />
                </span>
                <span className="search__meta">
                  <strong>{p.name}</strong>
                  <small>
                    {p.category}
                    {anyInStock(p) ? "" : " · sold out"}
                  </small>
                </span>
                <span className="search__price">{money(p.price)}</span>
              </Link>
            ))}
          </div>
          <Link className="search__all" to={`/shop?q=${encodeURIComponent(term)}`} onClick={finish}>
            See all results for “{term}” <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
          </Link>
        </>
      )}
    </div>
  );

  return children(form, results);
}
