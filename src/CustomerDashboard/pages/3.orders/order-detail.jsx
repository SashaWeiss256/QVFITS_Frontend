/* Account Order Detail */
import { Link, useParams } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useCancelMyOrder, useMyOrder } from "@/store/tanstackStore/queries/account";
import PaymentDue from "@/components/storefront/PaymentDue";
import { formatDate } from "@/utils/format";
import ReturnRequest from "./ReturnRequest";

// Orders are quoted in UGX whatever currency the shop is shown in.
export default function AccountOrderDetail() {
  const { id } = useParams();
  const { customer } = useCustomerAuth();
  const { data: order, isLoading, error } = useMyOrder(customer.id, id);
  const { moneyBase } = useCurrency();
  const cancel = useCancelMyOrder(customer.id);

  if (isLoading) return <PageLoader variant="form" />;
  // Another shopper's id or a stale link lands here too, not on a crash.
  if (error || !order) return <p className="text-ink-3">We couldn&apos;t find that order. <Link to="/account/orders" className="link-arrow">All orders</Link></p>;

  return (
    <div className="rounded-r-lg bg-white p-6 shadow-sh-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[1.3rem]">Order {order.ref}</h2>
        <StatusChip status={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink-3">Placed {formatDate(order.createdAt)}</p>
      {/* Order Lines: one row per product, size and colour. */}
      <ul className="mt-4 list-none p-0">
        {order.lines.map((l) => (
          <li key={`${l.productId}-${l.size}-${l.color}`} className="flex justify-between border-b border-line py-3">
            <span>{l.name} <small className="text-ink-3">· {l.color} · {l.size} · ×{l.qty}</small></span>
            <span>{moneyBase(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      {/* Totals */}
      <dl className="mt-4 grid grid-cols-[1fr_auto] gap-1 text-[.95rem]">
        {order.kitSaving > 0 && <><dt>Kit saving</dt><dd className="m-0 text-right">−{moneyBase(order.kitSaving)}</dd></>}
        <dt>Delivery</dt><dd className="m-0 text-right">{moneyBase(order.delivery)}</dd>
        {order.discount > 0 && <><dt>Discount</dt><dd className="m-0 text-right">−{moneyBase(order.discount)}</dd></>}
        <dt className="font-semibold">Total</dt><dd className="m-0 text-right font-semibold">{moneyBase(order.total)}</dd>
      </dl>
      <PaymentDue order={order} onCancel={() => cancel.mutate(order.id)} cancelling={cancel.isPending} />
      {cancel.error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-warn">{cancel.error.message}</p>}
      <ReturnRequest order={order} customerId={customer.id} />
    </div>
  );
}
