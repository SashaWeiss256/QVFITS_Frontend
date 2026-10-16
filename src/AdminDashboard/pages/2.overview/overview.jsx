/* Admin Overview */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { colorsResource, useCollection, useOverview } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";

const RANGES = [7, 30, 90];

// "Up 12% on the 30 days before", or nothing when there is nothing to compare.
function versus(now, before, days) {
  if (!before) return now ? `New this period` : undefined;
  const pct = Math.round(((now - before) / before) * 100);
  return `${pct >= 0 ? "Up" : "Down"} ${Math.abs(pct)}% on the ${days} days before`;
}

/**
 * The shop at a glance: money from paid orders (UGX), what needs doing
 * (orders to confirm, returns, reviews, messages), what sells, and what is
 * about to run out.
 */
export default function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data } = useOverview(days);
  const colors = useCollection(colorsResource);
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const colorName = (id) => colors.items.find((c) => c.id === id)?.name ?? id;

  const todo = data && [
    { label: "Orders waiting for payment", n: data.pending, to: "/admin/orders", perm: "orders" },
    { label: "Return requests", n: data.inbox.returns, to: "/admin/returns", perm: "returns" },
    { label: "Reviews to approve", n: data.inbox.reviews, to: "/admin/reviews", perm: "reviews" },
    { label: "New messages", n: data.inbox.messages, to: "/admin/messages", perm: "messages" },
  ].filter((t) => can(t.perm));

  return (
    <>
      <PageHeader
        title="Welcome back"
        lede="Sales from paid orders, in UGX."
        action={
          <div className="flex rounded-r-pill bg-white p-1 shadow-sh-1" role="group" aria-label="Period">
            {RANGES.map((d) => (
              <button key={d} type="button" aria-pressed={days === d} className={`min-h-9 rounded-r-pill px-4 text-sm font-semibold ${days === d ? "bg-brand-500 text-white" : "text-ink-3"}`} onClick={() => setDays(d)}>
                {d} days
              </button>
            ))}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={moneyBase(data?.revenue ?? 0)} note={data && versus(data.revenue, data.previous.revenue, days)} />
        <StatCard label="Paid orders" value={data?.orders ?? 0} note={data && versus(data.orders, data.previous.orders, days)} />
        <StatCard label="Average order" value={moneyBase(data?.averageOrder ?? 0)} />
        <StatCard label="New accounts" value={data?.newCustomers ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel title="Revenue by day">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byDay ?? []}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(d) => d.slice(5)} minTickGap={16} />
                <Tooltip formatter={(v) => moneyBase(v)} labelFormatter={(d) => formatDate(d)} />
                <Bar dataKey="revenue" fill="var(--brand-500)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="To do">
          <ul className="m-0 grid list-none gap-1 p-0">
            {todo?.map((t) => (
              <li key={t.label}>
                <Link to={t.to} className="flex min-h-11 items-center justify-between rounded-r-md px-3 hover:bg-brand-50">
                  <span className="text-sm">{t.label}</span>
                  <strong className={t.n ? "text-brand-600" : "text-ink-4"}>{t.n}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Best sellers">
          {data?.topProducts.length ? (
            <ol className="m-0 grid gap-2 pl-5 text-sm">
              {data.topProducts.map((p) => <li key={p.productId}><strong>{p.name}</strong> <span className="text-ink-3">· {p.units} sold · {moneyBase(p.revenue)}</span></li>)}
            </ol>
          ) : <p className="m-0 text-sm text-ink-3">No paid orders in this period.</p>}
        </Panel>
        <Panel title="Running low">
          {data?.lowStock.length ? (
            <ul className="m-0 grid list-none gap-2 p-0 text-sm">
              {data.lowStock.map((v) => (
                <li key={`${v.productId}-${v.color}-${v.size}`} className="flex justify-between gap-2">
                  <span>{v.name} <span className="text-ink-3">· {colorName(v.color)} · {v.size}</span></span>
                  <strong className={v.stock ? "text-[var(--star)]" : "text-warn"}>{v.stock || "Out"}</strong>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-sm text-ink-3">Nothing is running low.</p>}
          {can("inventory") && <Link to="/admin/inventory" className="link-arrow mt-3 inline-block text-sm">Inventory</Link>}
        </Panel>
        <Panel title="Latest orders">
          <ul className="m-0 grid list-none gap-2 p-0 text-sm">
            {data?.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2">
                <span><strong>{o.ref}</strong> <span className="text-ink-3">· {o.name}</span></span>
                <StatusChip status={o.status} />
              </li>
            ))}
          </ul>
          {can("orders") && <Link to="/admin/orders" className="link-arrow mt-3 inline-block text-sm">All orders</Link>}
        </Panel>
      </div>
    </>
  );
}
