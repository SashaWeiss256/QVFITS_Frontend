/* Piece Search */
import { useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { cn } from "@/utils/cn";

// Every word typed has to appear in the piece's name or one of its colours, so "long sleeve" or "bra black" both find it.
const matches = (p, words) => {
  const hay = `${p.name} ${(p.colors ?? []).join(" ")}`.toLowerCase();
  return words.every((w) => hay.includes(w));
};
const left = (p) => Object.values(p.stock ?? {}).reduce((n, q) => n + q, 0);

/**
 * Type to find a piece, then click it or press Enter to add it. Up and Down
 * move through the results, Escape closes them. The box stays focused after
 * each add, so a till can add several pieces without touching the mouse.
 */
export default function PieceSearch({ pieces, onPick }) {
  const id = useId();
  const { moneyBase } = useCurrency();
  const box = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces.slice(0, 40);
    const words = q.split(/\s+/);
    return pieces
      .filter((p) => matches(p, words))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)))
      .slice(0, 40);
  }, [pieces, query]);

  const choose = (p) => {
    if (!p || left(p) === 0) return;
    onPick(p);
    setQuery("");
    setAt(0);
    box.current?.focus();
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setAt((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAt((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[at]); }
    else if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" aria-hidden="true" />
      <input
        ref={box}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && results[at] ? `${id}-${results[at].id}` : undefined}
        aria-label="Search for a piece to add"
        autoComplete="off"
        className="input w-full pl-10"
        placeholder="Search by name or colour"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setAt(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          data-lenis-prevent
          className="absolute inset-x-0 top-full z-20 m-0 mt-1 max-h-72 list-none overflow-y-auto rounded-[14px] border border-line bg-white p-1 shadow-sh-2"
        >
          {results.length === 0 && <li className="px-3 py-3 text-sm text-ink-3">No piece matches "{query.trim()}".</li>}
          {results.map((p, i) => {
            const out = left(p) === 0;
            return (
              <li
                key={p.id}
                id={`${id}-${p.id}`}
                role="option"
                aria-selected={i === at}
                aria-disabled={out}
                // mousedown, not click: the box must not lose focus before the choice lands.
                onMouseDown={(e) => { e.preventDefault(); choose(p); }}
                onMouseEnter={() => setAt(i)}
                className={cn("flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-sm", i === at && "bg-brand-50", out && "cursor-not-allowed opacity-50")}
              >
                <span className="min-w-0 truncate font-medium">{p.name}</span>
                <span className="shrink-0 text-[.8rem] text-ink-3">{out ? "Sold out" : `${moneyBase(p.price)}, ${left(p)} left`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
