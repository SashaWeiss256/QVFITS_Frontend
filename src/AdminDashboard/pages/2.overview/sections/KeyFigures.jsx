/* Overview Key Figures */
import { Receipt, ShoppingBag, UserPlus, Wallet } from "lucide-react";

import StatCard from "@/AdminDashboard/components/StatCard";

// Percent change on the period before, or nothing when there is nothing to compare.
const change = (now, before) => (before ? Math.round(((now - before) / before) * 100) : undefined);

/** The four headline numbers, divided by hairlines rather than boxed one by one. */
export default function KeyFigures({ data, loading, days, money }) {
  const versus = `vs the ${days} days before`;
  const isNew = (now, before) => (!before && now ? "New this period" : versus);

  return (
    <section aria-label="Key figures" className="grid grid-cols-1 gap-px overflow-hidden rounded-r-lg border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Revenue" icon={Wallet} loading={loading} value={money(data?.revenue ?? 0)} change={data && change(data.revenue, data.previous.revenue)} note={data && isNew(data.revenue, data.previous.revenue)} />
      <StatCard label="Paid orders" icon={ShoppingBag} loading={loading} value={data?.orders ?? 0} change={data && change(data.orders, data.previous.orders)} note={data && isNew(data.orders, data.previous.orders)} />
      <StatCard label="Average order" icon={Receipt} loading={loading} value={money(data?.averageOrder ?? 0)} note="Revenue over paid orders" />
      <StatCard label="New accounts" icon={UserPlus} loading={loading} value={data?.newCustomers ?? 0} note={`Signed up in ${days} days`} />
    </section>
  );
}
