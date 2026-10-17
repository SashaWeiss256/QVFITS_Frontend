/* Shop Filters */
import { ArrowDown, ArrowUp } from "lucide-react";

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { filtersResource, useDocument } from "@/store/tanstackStore/queries/admin";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

// The shop's filter sidebar: which groups show, what they are called, and
// in what order. The options inside each come from the catalogue.
export default function ShopFilters() {
  const doc = useDocument(filtersResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const facets = [...draft.facets].sort((a, b) => a.position - b.position);

  const update = (id, patch) => set("facets", facets.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const move = (i, by) => {
    const next = [...facets];
    const [f] = next.splice(i, 1);
    next.splice(i + by, 0, f);
    set("facets", next.map((x, position) => ({ ...x, position })));
  };

  return (
    <>
      <p className="mt-0 text-sm text-ink-3">Turn a group off to hide it from the shop sidebar; rename it to suit how shoppers talk.</p>
      <ul className="m-0 list-none p-0">
        {facets.map((f, i) => (
          <li key={f.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
            <span className="flex">
              <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
              <button type="button" className="icon-btn" aria-label="Move down" disabled={i === facets.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
            </span>
            <Field label={`Label for ${f.id}`} className="min-w-[200px] flex-1" value={f.label} onChange={(e) => update(f.id, { label: e.target.value })} />
            <Toggle checked={f.visible} onChange={(visible) => update(f.id, { visible })} label="Shown" />
          </li>
        ))}
      </ul>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save({ facets: draft.facets }))} />
    </>
  );
}
