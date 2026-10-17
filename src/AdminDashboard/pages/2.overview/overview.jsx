/* Admin Overview */
import { useState } from "react";

import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOverview } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import KeyFigures from "./sections/KeyFigures";
import NeedsAttention from "./sections/NeedsAttention";
import RecentOrders from "./sections/RecentOrders";
import RevenueChart from "./sections/RevenueChart";
import RunningLow from "./sections/RunningLow";
import ShopReady from "./sections/ShopReady";
import TopSellers from "./sections/TopSellers";

const RANGES = [7, 30, 90];

/**
 * The shop at a glance: money from paid orders (UGX), what needs doing,
 * what sells, what is about to run out, and the latest orders.
 */
export default function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useOverview(days);
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();

  return (
    <>
      <PageHeader
        lede={`Paid orders over the last ${days} days, in UGX. Cancelled and refunded orders are left out.`}
        action={
          <div className="flex rounded-r-pill border border-line-2 bg-white p-0.5" role="group" aria-label="Period">
            {RANGES.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={days === d}
                onClick={() => setDays(d)}
                className={cn(
                  "min-h-9 rounded-r-pill px-3 text-[.8rem] font-semibold tabular-nums outline-none transition-[background-color,color] duration-200 ease-q focus-visible:ring-2 focus-visible:ring-brand-300 sm:px-3.5",
                  days === d ? "bg-[image:var(--brand-grad)] text-white" : "text-ink-3 hover:text-ink",
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        }
      />

      {/* minmax(0,1fr): the orders table scrolls inside its panel instead of widening the page */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
        {/* Only for those who can do the setup; it hides itself once all is done. */}
        {["categories", "size-guide", "products", "settings", "home-content"].every((m) => can(m, "edit")) && <ShopReady />}
        <KeyFigures data={data} loading={isLoading} days={days} money={moneyBase} />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <RevenueChart byDay={data?.byDay} loading={isLoading} money={moneyBase} />
          <NeedsAttention data={data} loading={isLoading} can={can} />
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <TopSellers rows={data?.topProducts} loading={isLoading} money={moneyBase} />
          <RunningLow rows={data?.lowStock} loading={isLoading} canOpen={can("products")} />
        </div>

        <RecentOrders orders={data?.recentOrders} loading={isLoading} money={moneyBase} canOpen={can("orders")} />
      </div>
    </>
  );
}
