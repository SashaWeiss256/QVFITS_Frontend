/* Overview Top Sellers */
import { Link } from "react-router-dom";

import Panel from "@/AdminDashboard/components/Panel";

/** The pieces that brought in most, each with a bar for its share against the best. */
export default function TopSellers({ rows = [], loading, money }) {
  // The best seller sets the length of the bars; every other bar is a share of it.
  const max = rows[0]?.revenue || 1;

  {/* Best Sellers: the five pieces that took the most money in the period, each linking to its product */}
  return (
    <Panel title="Best sellers" hint="By revenue in this period">
      {loading ? (
        <div className="grid gap-3">{[0, 1, 2, 3].map((i) => <span key={i} className="skel block h-10 rounded-r-md" aria-hidden="true" />)}</div>
      ) : rows.length === 0 ? (
        <p className="m-0 text-sm text-ink-3">No paid orders in this period. Sales land here as they come in.</p>
      ) : (
        <ol className="m-0 grid list-none gap-4 p-0">
          {rows.map((p, i) => (
            <li key={p.productId} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
              <span className="text-[.8rem] font-bold tabular-nums text-ink-4">{i + 1}</span>
              <Link to={`/admin/products/${p.productId}`} className="truncate text-sm font-semibold text-ink transition-colors duration-200 hover:text-brand-600">
                {p.name}
              </Link>
              <span className="text-right text-sm font-semibold tabular-nums">{money(p.revenue)}</span>
              <span className="col-start-2 h-1.5 overflow-hidden rounded-r-pill bg-cream-2">
                <span className="block h-full rounded-r-pill bg-[image:var(--brand-grad)]" style={{ width: `${Math.max(4, (p.revenue / max) * 100)}%` }} />
              </span>
              <span className="text-right text-[.75rem] tabular-nums text-ink-4">{p.units} sold</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
