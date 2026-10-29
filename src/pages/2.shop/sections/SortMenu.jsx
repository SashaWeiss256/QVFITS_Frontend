/* Sort Menu */
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { t } from "@/i18n/translate";

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
    const items = [...root.current.querySelectorAll("[role=option]")];
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
    <div className="relative" ref={root}>
      {/* Button: names the current order */}
      <button
        ref={button}
        type="button"
        className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] transition-colors hover:text-brand-600"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {/* One span, so the button's gap doesn't split "Sort:" from its colon. */}
        <span>{t("Sort")}<span className="hidden sm:inline">: <b className="font-display font-semibold">{current?.label}</b></span></span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {/* List */}
      {open && (
        <ul className="absolute left-0 top-full z-40 mt-2 w-60 border border-line bg-cream py-2 shadow-sh-3 animate-[promo-in_0.35s_var(--ease-q)]" role="listbox" aria-label={t("Sort by")} onKeyDown={onListKey}>
          {sorts.map((s) => (
            <li key={s.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={s.id === value}
                className={`flex min-h-11 w-full items-center justify-between px-5 text-left text-[0.9rem] transition-colors hover:bg-beige/60 ${s.id === value ? "font-semibold text-ink" : "text-ink-2"}`}
                onClick={() => pick(s.id)}
              >
                {s.label}
                {s.id === value && <Check className="h-4 w-4 text-brand-500" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
