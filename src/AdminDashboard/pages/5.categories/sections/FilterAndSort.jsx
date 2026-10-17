/* Filter And Sort */
import { ArrowDown, ArrowUp } from "lucide-react";

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { filtersResource, groupsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

const BUILT_IN = { size: "Size", color: "Colour", price: "Price" };

/**
 * The shop's two controls above the grid, side by side as shoppers see
 * them: the Filter drawer (its sections, top to bottom) and the Sort menu
 * (its choices, and the one a shop page opens with). The Shop by groups
 * join the drawer from the Shop by tab, each with its "Shop filter" switch.
 */
export default function FilterAndSort() {
  const doc = useDocument(filtersResource);
  const groups = useCollection(groupsResource);
  if (!doc.data || groups.isLoading) return <PageLoader variant="form" />;
  return <Editor doc={doc} groups={groups.items} />;
}

/** Up and down buttons for one row of an ordered list. */
function Mover({ i, last, onMove, disabled }) {
  return (
    <span className="flex">
      <button type="button" className="icon-btn" aria-label="Move up" disabled={disabled || i === 0} onClick={() => onMove(i, -1)}><ArrowUp className="h-4 w-4" /></button>
      <button type="button" className="icon-btn" aria-label="Move down" disabled={disabled || i === last} onClick={() => onMove(i, 1)}><ArrowDown className="h-4 w-4" /></button>
    </span>
  );
}

const moved = (list, i, by) => {
  const next = [...list];
  const [x] = next.splice(i, 1);
  next.splice(i + by, 0, x);
  return next.map((r, position) => ({ ...r, position }));
};

function Editor({ doc, groups }) {
  const { can } = useAdminAuth();
  const canEdit = can("categories", "edit");
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);

  // Filter sections: the built-in ones, plus every Shop by group switched on as a filter.
  const shown = groups.filter((g) => g.inFilters && g.active !== false);
  // Category is the built-in section called "category"; every other group is "group:<id>".
  const idOf = (g) => (g.kind === "category" ? "category" : `group:${g.id}`);
  const groupOf = (id) => shown.find((g) => idOf(g) === id);
  // Sections saved earlier, minus any group that is no longer a filter.
  const laid = draft.facets.filter((f) => BUILT_IN[f.id] || groupOf(f.id));
  // Anything new (a group added since the layout was saved, or a built-in section never saved) joins at the end, shown.
  const missing = [...Object.entries(BUILT_IN).map(([id, label]) => ({ id, label })), ...shown.map((g) => ({ id: idOf(g), label: g.name }))]
    .filter((x) => !laid.some((f) => f.id === x.id))
    .map((x, i) => ({ ...x, visible: true, position: laid.length + i }));
  const facets = [...laid, ...missing].sort((a, b) => a.position - b.position);
  const setFacet = (id, patch) => set("facets", facets.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const sort = draft.sort;
  // Sort choices in their saved order.
  const options = [...sort.options].sort((a, b) => a.position - b.position);
  // The default order must be one shoppers can see, so hiding it moves the default to the first visible choice.
  const setOption = (id, patch) => {
    const next = options.map((o) => (o.id === id ? { ...o, ...patch } : o));
    // The default must be a choice shoppers can see.
    const def = next.find((o) => o.id === sort.default)?.visible ? sort.default : next.find((o) => o.visible)?.id ?? sort.default;
    set("sort", { ...sort, options: next, default: def });
  };
  const visibleSorts = options.filter((o) => o.visible).length;

  return (
    <>
      {/* Page Header */}
      <PageHeader lede="The two controls above the shop's products, side by side: Filter opens the drawer, Sort orders the grid." />
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Filter: the sections of the shop's drawer, in order */}
        <Panel title="Filter" hint="Sections of the drawer, top to bottom">
          <ul className="m-0 list-none p-0">
            {facets.map((f, i) => {
              const g = groupOf(f.id);
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
                  <Mover i={i} last={facets.length - 1} disabled={!canEdit} onMove={(at, by) => set("facets", moved(facets, at, by))} />
                  {g ? (
                    <span className="min-w-[180px] flex-1">
                      <strong className="block text-sm">{g.name}</strong>
                      <span className="text-xs text-ink-3">Shop by group. Rename it, or take it out of the drawer, on the Shop by tab.</span>
                    </span>
                  ) : (
                    <Field label={`Name for ${BUILT_IN[f.id].toLowerCase()}`} className="min-w-[180px] flex-1" value={f.label} disabled={!canEdit} onChange={(e) => setFacet(f.id, { label: e.target.value })} />
                  )}
                  <Toggle checked={f.visible} onChange={(visible) => setFacet(f.id, { visible })} label="Shown" disabled={!canEdit} />
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Sort: the choices in the Sort menu, and which one a shop page opens with */}
        <Panel title="Sort" hint="Choices in the Sort menu">
          <ul className="m-0 list-none p-0" role="radiogroup" aria-label="Default order">
            {options.map((o, i) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
                <Mover i={i} last={options.length - 1} disabled={!canEdit} onMove={(at, by) => set("sort", { ...sort, options: moved(options, at, by) })} />
                <Field label="Name" className="min-w-[160px] flex-1" value={o.label} disabled={!canEdit} onChange={(e) => setOption(o.id, { label: e.target.value })} />
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="default-sort" checked={sort.default === o.id} disabled={!canEdit || !o.visible} onChange={() => set("sort", { ...sort, default: o.id })} />
                  Default
                </label>
                <Toggle checked={o.visible} onChange={(visible) => setOption(o.id, { visible })} label="Shown" disabled={!canEdit || (o.visible && visibleSorts === 1)} />
              </li>
            ))}
          </ul>
          <p className="m-0 mt-3 text-xs text-ink-3">Every shop page opens in the default order. Featured puts pinned and best selling pieces first, then new arrivals.</p>
        </Panel>
      </div>
      {/* Save Bar */}
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save({ facets, sort: { ...sort, options } }))} />}
    </>
  );
}
