/* Account Orders */
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useMyOrders } from "@/store/tanstackStore/queries/account";
import { formatDate } from "@/utils/format";

// Only this shopper's orders (the API filters by account); each row opens its detail.
export default function AccountOrders() {
  const { customer } = useCustomerAuth();
  const { data: orders, isLoading } = useMyOrders(customer.id);
  const { moneyBase } = useCurrency();

  if (isLoading) return <PageLoader variant="list" />;
  if (!orders?.length) {
    return <EmptyState icon={Package} action={<Link to="/shop" className="btn btn--primary">Shop the range</Link>}>No orders yet.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-sh-1">
      {/* The account layout already shows the page title; keep the heading for screen readers. */}
      <h2 className="sr-only">Orders</h2>
      {orders.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 last:border-0 hover:bg-sand-50">
          <div>
            <strong className="font-display">{o.ref}</strong>
            <p className="m-0 text-sm text-ink-3">{formatDate(o.createdAt)} · {o.lines.length} {o.lines.length === 1 ? "piece" : "pieces"}</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusChip status={o.status} />
            <span className="font-semibold">{moneyBase(o.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
