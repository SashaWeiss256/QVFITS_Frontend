/* Admin Overview */
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useOverview } from "@/store/tanstackStore/queries/admin";
import PageHeader from "../../components/PageHeader";
import Panel from "../../components/Panel";
import StatCard from "../../components/StatCard";

// Paid orders only; all money in UGX.
export default function AdminOverview() {
  const { data } = useOverview();
  const { moneyBase } = useCurrency();

  return (
    <>
      <PageHeader title="Overview" lede="Sales from paid orders, in UGX." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={moneyBase(data?.revenue ?? 0)} />
        <StatCard label="Paid orders" value={data?.orders ?? 0} />
        <StatCard label="Awaiting payment" value={data?.pending ?? 0} />
        <StatCard label="Average order" value={moneyBase(data?.averageOrder ?? 0)} />
      </div>
      <Panel title="Revenue by day" className="mt-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.byDay ?? []}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(v) => moneyBase(v)} />
              <Bar dataKey="revenue" fill="var(--brand-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
