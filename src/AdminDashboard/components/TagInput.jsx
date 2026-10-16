/* Tag Input */
import { useState } from "react";
import { X } from "lucide-react";

/**
 * A list of short strings typed one at a time: product details, customer
 * tags, promo bar lines. Enter or comma adds; the cross removes.
 */
export default function TagInput({ id, value = [], onChange, placeholder = "Type and press Enter", allowCommas = false }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };

  return (
    <div className="rounded-r-sm border border-line-2 bg-white p-2">
      {value.length > 0 && (
        <ul className="m-0 mb-2 flex list-none flex-wrap gap-1.5 p-0">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-r-pill bg-brand-50 py-1 pr-1 pl-3 text-sm text-brand-600">
              {v}
              <button type="button" className="grid h-6 w-6 place-items-center rounded-full hover:bg-brand-100" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        className="w-full border-0 bg-transparent px-1 py-1.5 text-sm outline-none"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || (!allowCommas && e.key === ",")) {
            e.preventDefault();
            add();
          }
        }}
      />
    </div>
  );
}
