/* Filter Drawer */
import { useState } from "react";
import { Search } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import Drawer from "./Drawer";

/**
 * A list's filters as ticked groups in a side drawer (after belioras
 * DashFilters): within a group any ticked value matches, across groups all
 * must. Each option shows how many rows it would match right now. A search
 * box finds an option when there are many.
 */
export default function FilterDrawer({ open, onClose, filters, values, onChange, onClear, countOf, resultCount }) {
  const [find, setFind] = useState("");
  const q = find.trim().toLowerCase();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      subtitle={`${resultCount} ${resultCount === 1 ? "result" : "results"}`}
      footer={
        <div className="flex justify-between gap-2.5">
          <Button variant="ghost" onClick={onClear}>Clear all</Button>
          <Button onClick={onClose}>Show {resultCount}</Button>
        </div>
      }
    >
      <label className="relative mb-5 block">
        <span className="sr-only">Find a filter</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4" aria-hidden="true" />
        <input className="input w-full pl-9" type="search" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find a filter…" />
      </label>
      <div className="grid gap-6">
        {filters.map((f) => {
          const options = f.options.filter((o) => !q || o.label.toLowerCase().includes(q) || f.label.toLowerCase().includes(q));
          if (!options.length) return null;
          const picked = values[f.id] ?? [];
          return (
            <fieldset key={f.id} className="m-0 border-0 p-0">
              <legend className="mb-2 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">{f.label}</legend>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {options.map((o) => {
                  const on = picked.includes(o.value);
                  const n = countOf(f, o.value);
                  return (
                    <li key={o.value}>
                      <label className={cn("flex min-h-10 cursor-pointer items-center gap-3 rounded-r-md px-2 transition-colors duration-150 hover:bg-cream", on && "bg-brand-50")}>
                        <input type="checkbox" checked={on} onChange={() => onChange(f.id, on ? picked.filter((v) => v !== o.value) : [...picked, o.value])} />
                        <span className="flex-1 text-sm">{o.label}</span>
                        <span className="text-xs tabular-nums text-ink-4">{n}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          );
        })}
      </div>
    </Drawer>
  );
}
