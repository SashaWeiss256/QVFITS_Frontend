/* Size Chooser */
import { useState } from "react";
import { Link } from "react-router-dom";

import Modal from "@/components/ui/Modal";
import { useFacets } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { colorsInStock, forColorName, inStock, productSizes } from "@/utils/stockLevel";
import Photo from "./Photo";

/**
 * The quick adds (a card's Add to bag, a kit's Add all, an outfit) never pick
 * a size for the shopper: this dialog asks for one per piece first. Colours
 * start on the one given (or the first in stock) and can be changed; sizes
 * always start empty. Nothing goes in the bag until every piece has a size.
 *
 *   pieces: [{ product, color?, kitId? }]; onAdd(lines); onClose().
 */
export default function SizeChooser({ pieces, title, onAdd, onClose }) {
  const { data: facets } = useFacets();
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "var(--color-line-2)";
  const [picks, setPicks] = useState(() =>
    pieces.map(({ product: p, color }) => {
      const colours = colorsInStock(p);
      return { color: color && colours.includes(color) ? color : colours[0] ?? p.colors[0], size: null };
    }),
  );
  const [tried, setTried] = useState(false);
  const missing = picks.filter((x) => !x.size).length;

  const set = (i, patch) => setPicks((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  // A new colour keeps the size only when that colour has it; it never picks one.
  const chooseColor = (i, color) => {
    const shown = forColorName(pieces[i].product, color);
    set(i, { color, size: picks[i].size && inStock(shown, picks[i].size) ? picks[i].size : null });
  };

  const add = () => {
    if (missing) {
      setTried(true);
      return;
    }
    onAdd(pieces.map(({ product: p, kitId }, i) => ({ productId: p.id, color: picks[i].color, size: picks[i].size, qty: 1, ...(kitId ? { kitId } : {}) })));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={title ?? (pieces.length > 1 ? "Choose your sizes" : "Choose your size")}
      size={pieces.length > 1 ? "md" : "sm"}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn("m-0 text-[0.85rem]", tried && missing ? "text-warn" : "text-ink-3")} aria-live="polite">
            {missing ? `${missing === pieces.length && pieces.length === 1 ? "Pick a size" : `${missing} still to size`}` : "All set"}
          </p>
          <button type="button" className="btn btn--primary" onClick={add} aria-disabled={Boolean(missing)}>
            {pieces.length > 1 ? "Add all to bag" : "Add to bag"}
          </button>
        </div>
      }
    >
      <ul className="m-0 grid list-none gap-5 p-0">
        {pieces.map(({ product: p }, i) => {
          const pick = picks[i];
          const shown = forColorName(p, pick.color);
          const colours = colorsInStock(p);
          const bad = tried && !pick.size;
          return (
            <li key={`${p.id}-${i}`} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4">
              <Link to={`/product/${p.slug}`} onClick={onClose} className="relative block aspect-[3/4] overflow-hidden bg-beige">
                <Photo photo={p.photos[0]} label={p.name} />
              </Link>
              <div className="min-w-0">
                <p className="m-0 truncate font-display text-[1rem]">{p.name}</p>
                {/* Colour: only when there is more than one to choose from */}
                {colours.length > 1 ? (
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={`Colour of ${p.name}`}>
                    {colours.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={c === pick.color}
                        title={c}
                        aria-label={c}
                        onClick={() => chooseColor(i, c)}
                        className={cn("h-7 w-7 rounded-full ring-1 ring-ink/15", c === pick.color && "ring-2 ring-ink ring-offset-2")}
                        style={{ background: swatch(c) }}
                      />
                    ))}
                    <span className="self-center text-[0.82rem] text-ink-3">{pick.color}</span>
                  </div>
                ) : (
                  <p className="m-0 mt-1 text-[0.82rem] text-ink-3">{pick.color}</p>
                )}
                {/* Size: always the shopper's own choice */}
                <div
                  className={cn("mt-3 grid auto-cols-fr grid-flow-col gap-1.5 rounded-[2px]", bad && "outline outline-2 outline-offset-2 outline-warn")}
                  role="radiogroup"
                  aria-label={`Size of ${p.name}`}
                  aria-invalid={bad || undefined}
                >
                  {productSizes(shown).map((s) => {
                    const out = !inStock(shown, s);
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={s === pick.size}
                        disabled={out}
                        aria-label={out ? `${s}, sold out` : s}
                        onClick={() => set(i, { size: s })}
                        className={cn(
                          "min-h-11 border text-[0.86rem] transition-colors",
                          s === pick.size ? "border-ink bg-ink text-cream" : "border-line-2 hover:border-ink",
                          out && "cursor-not-allowed text-ink-4 line-through decoration-1 hover:border-line-2",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {bad && <p role="alert" className="m-0 mt-1.5 text-xs font-semibold text-warn">Choose a size</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <Link to="/size-guide" onClick={onClose} className="mt-5 inline-flex min-h-11 items-center text-[0.85rem] underline underline-offset-4 hover:text-brand-600">Size guide</Link>
    </Modal>
  );
}
