/* Filter Drawer */
import FilterChips from "@/components/ui/FilterChips";
import FilterSheet, { FilterSection } from "@/components/ui/FilterSheet";

/**
 * A list's filters, in the same drawer shoppers get on the shop: folding
 * sections of chips, each saying how many rows it would match right now.
 * Within a section any ticked chip matches, across sections all must (after
 * belioras DashFilters). The filters are the table's own ({ id, label,
 * options }); the ticked values live in the address.
 */
export default function FilterDrawer({ open, onClose, filters, values, onChange, onClear, countOf, resultCount }) {
  return (
    <FilterSheet open={open} onClose={onClose} id="list-filters" title="Filter" count={resultCount} onClear={onClear}>
      {filters.map((f) => {
        const picked = values[f.id] ?? [];
        const options = f.options.map((o) => ({ value: o.value, label: o.label, swatch: o.swatch, count: countOf(f, o.value) }));
        return (
          <FilterSection key={f.id} title={f.label} picked={picked.length}>
            <FilterChips
              title={f.label}
              options={options}
              selected={picked}
              onToggle={(v) => onChange(f.id, picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v])}
            />
          </FilterSection>
        );
      })}
    </FilterSheet>
  );
}
