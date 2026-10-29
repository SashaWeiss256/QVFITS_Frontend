/* Size Chart */
import { Plus, Trash2 } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { sizeChartResource, useDocument } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

// Body measurements in cm, as a range per size; the shop converts to inches.
const RANGES = [["bust", "Bust"], ["waist", "Waist"], ["hip", "Hips"]];
// The size names a row carries: the shop's own, then UK, US and EU.
const LABELS = [["size", "Size"], ["uk", "UK"], ["us", "US"], ["eu", "EU"]];

/** The size chart the size guide, the finder and Vee all read. */
export default function SizeChart() {
  const doc = useDocument(sizeChartResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const { draft: rows, set, dirty, reset, commit } = useDraft(doc.data);
  const canEdit = can("size-guide", "edit");
  // Changes one row of the chart and leaves the rest.
  const update = (i, patch) => set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  // A measurement typed as text becomes a number; anything else counts as 0.
  const num = (v) => Number(String(v).replace(/[^\d.]/g, "")) || 0;
  // One look for every cell, so the grid lines up.
  const cell = "w-16 rounded-[10px] border border-line-2 px-2 py-1.5 text-center";

  return (
    <>
      <Panel>
        {/* Chart: readable without the edit permission, editable with it */}
        <fieldset disabled={!canEdit} className="m-0 min-w-0 overflow-x-auto border-0 p-0">
          <table className="w-full border-collapse text-sm">
            {/* Column Headings */}
            <thead>
              <tr className="border-b border-line">
                {LABELS.map(([, l]) => <th key={l} scope="col" className="eyebrow px-2 py-2 text-left">{l}</th>)}
                {RANGES.map(([, l]) => <th key={l} scope="col" className="eyebrow px-2 py-2 text-center">{l} (cm)</th>)}
                <th scope="col"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            {/* One row per size: its names, then a from and a to for each measurement */}
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {LABELS.map(([k, l]) => (
                    <td key={k} className="px-1 py-1.5">
                      <input className={cell} aria-label={`${l} for row ${i + 1}`} value={r[k] ?? ""} onChange={(e) => update(i, { [k]: e.target.value })} />
                    </td>
                  ))}
                  {RANGES.map(([k, l]) => (
                    <td key={k} className="px-1 py-1.5 text-center whitespace-nowrap">
                      <input className={cell} inputMode="numeric" aria-label={`${l} from, ${r.size}`} value={r[k]?.[0] ?? ""} onChange={(e) => update(i, { [k]: [num(e.target.value), r[k]?.[1] ?? 0] })} />
                      <span className="px-1 text-ink-3">to</span>
                      <input className={cell} inputMode="numeric" aria-label={`${l} to, ${r.size}`} value={r[k]?.[1] ?? ""} onChange={(e) => update(i, { [k]: [r[k]?.[0] ?? 0, num(e.target.value)] })} />
                    </td>
                  ))}
                  <td className="px-1"><button type="button" className="icon-btn text-warn" aria-label={`Remove ${r.size}`} onClick={() => set(rows.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn--soft mt-4" onClick={() => set([...rows, { size: "", uk: "", us: "", eu: "", bust: [0, 0], waist: [0, 0], hip: [0, 0] }])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a size
          </button>
        </fieldset>
      </Panel>
      {/* Save Bar */}
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(rows))} />
    </>
  );
}
