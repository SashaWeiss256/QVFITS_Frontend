/* Sort Menu */
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

/**
 * The order of the grid, beside the Filter button: a button naming the
 * current order, and a short list that drops from it. The choices and the
 * default come from the admin (Catalog, Categories, Filter and sort).
 */
export default function SortMenu({ sorts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const current = sorts.find((s) => s.id === value) ?? sorts[0];

  // Outside clicks and Escape close it; Escape hands focus back to the button.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // Focus lands on the chosen order, so arrows start from there.
    root.current?.querySelector('[aria-selected="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onListKey = (e) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const items = [...root.current.querySelectorAll(".sortmenu__opt")];
    const i = items.indexOf(document.activeElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  const pick = (id) => {
    onChange(id);
    setOpen(false);
    button.current?.focus();
  };

  return (
    <div className="sortmenu" ref={root}>
      <button
        ref={button}
        type="button"
        className="btn btn--ghost sortmenu__btn min-h-10 px-4 text-[.88rem]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        {/* One span, so the button's gap doesn't split "Sort:" from its colon. */}
        <span>Sort<span className="hidden sm:inline">: <b>{current?.label}</b></span></span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <ul className="sortmenu__list" role="listbox" aria-label="Sort by" onKeyDown={onListKey}>
          {sorts.map((s) => (
            <li key={s.id} role="presentation">
              <button type="button" role="option" aria-selected={s.id === value} className="sortmenu__opt" onClick={() => pick(s.id)}>
                {s.label}
                {s.id === value && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
