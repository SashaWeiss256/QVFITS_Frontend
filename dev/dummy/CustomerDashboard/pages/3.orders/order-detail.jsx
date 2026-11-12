/* Account Order Detail */
import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import StatusChip from "@/components/ui/StatusChip";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useCancelMyOrder, useMyOrder } from "@/store/tanstackStore/queries/account";
import { useSettings } from "@/store/tanstackStore/queries/site";
import PaymentDue from "@/components/storefront/PaymentDue";
import { formatDate } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { cn } from "@/utils/cn";
import ReturnRequest from "./ReturnRequest";

// The path an order takes, left to right. A cancelled or refunded order has no path to show.
const STEPS = [
  { id: "pending", label: "Placed" },
  { id: "paid", label: "Confirmed" },
  { id: "packed", label: "Packed" },
  { id: "out_for_delivery", label: "On the way" },
  { id: "delivered", label: "Delivered" },
];
const PROGRESS = { pending: 0, paid: 1, packed: 2, out_for_delivery: 3, delivered: 4 };

// Orders are quoted in UGX whatever currency the shop is shown in.
export default function AccountOrderDetail() {
  const { id } = useParams();
  const { customer } = useCustomerAuth();
  const { data: order, isLoading, error } = useMyOrder(customer.id, id);
  const { data: settings } = useSettings();
  const { moneyBase } = useCurrency();
  const cancel = useCancelMyOrder(customer.id);

  if (isLoading) return <PageLoader variant="form" />;
  // Another shopper's id or a stale link lands here too, not on a crash.
  if (error || !order) return <p className="text-ink-3">We couldn&apos;t find that order. <Link to="/account/orders" className="link-arrow">All orders</Link></p>;

  const at = PROGRESS[order.status];
  const onPath = at !== undefined;

  return (
    <div className="rounded-[22px] border border-line bg-white p-6 shadow-sh-1 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[1.3rem]">Order {order.ref}</h2>
        <StatusChip status={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink-3">Placed {formatDate(order.createdAt)}</p>

      {/* Progress: the steps on one hairline, finished ones in brand, the current one in ink */}
      {onPath && (
        <ol className="my-8 flex list-none items-start p-0" aria-label="Order progress">
          {STEPS.map((s, i) => {
            const done = i < at;
            const current = i === at;
            return (
              <li key={s.id} className="relative flex flex-1 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                {i > 0 && <span className={cn("absolute right-1/2 top-3.5 h-px w-full", i <= at ? "bg-brand-500" : "bg-line-2")} aria-hidden="true" />}
                <span className={cn("relative grid h-7 w-7 place-items-center rounded-full border text-[.75rem]", done && "border-brand-500 bg-brand-500 text-white", current && "border-ink bg-ink text-cream", !done && !current && "border-line-2 bg-white text-ink-4")}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("mt-2 text-[.78rem] sm:text-[.84rem]", current ? "font-medium text-ink" : done ? "text-ink-2" : "text-ink-4")}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}

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
        {order.kitSaving > 0 && <><dt>Kit saving</dt><dd className="m-0 text-right">{moneyBase(order.kitSaving)} off</dd></>}
        <dt>Delivery</dt><dd className="m-0 text-right">{moneyBase(order.delivery)}</dd>
        {order.discount > 0 && <><dt>Discount</dt><dd className="m-0 text-right">{moneyBase(order.discount)} off</dd></>}
        <dt className="font-semibold">Total</dt><dd className="m-0 text-right font-semibold">{moneyBase(order.total)}</dd>
      </dl>
      <PaymentDue order={order} onCancel={() => cancel.mutate(order.id)} cancelling={cancel.isPending} />
      {cancel.error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-warn">{cancel.error.message}</p>}

      {/* Help: the team answers on WhatsApp, with the reference already in the message */}
      {settings?.whatsapp && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-sand-100 p-5">
          <div>
            <strong className="block font-display text-[1rem]">Have a question about this order?</strong>
            <p className="m-0 mt-1 text-[.86rem] text-ink-3">Our team replies on WhatsApp about timing, changes and delivery.</p>
          </div>
          <a className="btn btn--ghost" href={whatsappLink(settings.whatsapp, `Hi QV team, I have a question about my order ${order.ref}.`)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      )}
      <ReturnRequest order={order} customerId={customer.id} />
    </div>
  );
}
