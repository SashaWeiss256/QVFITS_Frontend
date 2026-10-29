/* Overview Running Low */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { colorsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";

/** Sizes about to sell out, fewest left first. Sold out reads in the warning tone. */
export default function RunningLow({ rows = [], loading, canOpen }) {
  const colors = useCollection(colorsResource);
  // The stock rows carry a colour id; show its name.
  const colorName = (id) => colors.items.find((c) => c.id === id)?.name ?? id;

  {/* Running Low: sizes at or under the Settings low-stock level, fewest first, each linking to the stock page */}
  return (
    <Panel
      title="Running low"
      hint="Active pieces at or under the low stock level"
      action={canOpen && (
        <Link to="/admin/products?tab=stock" className="group -my-2 inline-flex min-h-10 items-center gap-1 text-[.82rem] font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-500">
          Stock <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-q group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    >
      {loading ? (
        <div className="grid gap-2">{[0, 1, 2, 3].map((i) => <span key={i} className="skel block h-9 rounded-[14px]" aria-hidden="true" />)}</div>
      ) : rows.length === 0 ? (
        <p className="m-0 text-sm text-ink-3">Nothing is running low.</p>
      ) : (
        <ul className="m-0 grid list-none divide-y divide-line p-0">
          {rows.map((v) => (
            <li key={`${v.productId}-${v.color}-${v.size}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-semibold">{v.name}</span>
                <span className="text-ink-4"> {colorName(v.color)}, {v.size}</span>
              </span>
              <span className={`shrink-0 rounded-r-pill px-2 py-0.5 text-[.75rem] font-bold tabular-nums ${v.stock ? "bg-[var(--star)]/15 text-ink-2" : "bg-warn/10 text-warn"}`}>
                {v.stock ? `${v.stock} left` : "Sold out"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
