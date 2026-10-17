/* Overview Recent Orders */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import StatusChip from "@/components/ui/StatusChip";
import { formatDate } from "@/utils/format";
import Panel from "@/AdminDashboard/components/Panel";

/** The six newest orders in any state, as a compact table. */
export default function RecentOrders({ orders = [], loading, money, canOpen }) {
  return (
    <Panel
      flush
      title="Latest orders"
      action={canOpen && (
        <Link to="/admin/orders" className="group inline-flex items-center gap-1 text-[.82rem] font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-500">
          All orders <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-q group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    >
      {loading ? (
        <div className="grid gap-2 p-5">{[0, 1, 2].map((i) => <span key={i} className="skel block h-10 rounded-r-md" aria-hidden="true" />)}</div>
      ) : orders.length === 0 ? (
        <p className="m-0 p-6 text-sm text-ink-3">No orders yet. Orders from the shop and WhatsApp land here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[.7rem] uppercase tracking-[0.14em] text-ink-4">
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Order</th>
                <th scope="col" className="px-3 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-3 py-3 font-semibold">Placed</th>
                <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold sm:px-6">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors duration-150 hover:bg-cream">
                  <td className="px-5 py-3 font-semibold tabular-nums sm:px-6">{o.ref}</td>
                  <td className="px-3 py-3 text-ink-2">{o.name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-4">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-3"><StatusChip status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums sm:px-6">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
