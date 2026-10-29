/* List Editor */
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

/**
 * An ordered list of items edited in place: hero slides, menu links, value
 * cards. Each item renders its own fields through `render(item, update)`;
 * the arrows reorder and the bin removes. Keyboard friendly, no dragging
 * needed.
 */
export default function ListEditor({ items = [], onChange, render, newItem, addLabel = "Add", itemLabel = (_, i) => `Item ${i + 1}`, max }) {
  // Changes one item of the list and leaves the others.
  const set = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  // Moves an item up or down by one place.
  const move = (i, by) => {
    const next = [...items];
    const [it] = next.splice(i, 1);
    next.splice(i + by, 0, it);
    onChange(next);
  };

  {/* One card per item, with its own ordering and remove buttons; the page supplies what goes inside */}
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={item.id ?? i} className="rounded-[14px] border border-line bg-white p-4">
          <div className="mb-3 flex items-center gap-1">
            <strong className="mr-auto text-sm">{itemLabel(item, i)}</strong>
            <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" className="icon-btn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
            <button type="button" className="icon-btn text-warn" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
          </div>
          {render(item, (patch) => set(i, patch), i)}
        </div>
      ))}
      {/* Add: hidden once the limit (if any) is reached, so a tile row can't outgrow its space. */}
      {newItem && (!max || items.length < max) && (
        <button type="button" className="btn btn--soft justify-self-start" onClick={() => onChange([...items, newItem()])}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {addLabel}
        </button>
      )}
    </div>
  );
}
