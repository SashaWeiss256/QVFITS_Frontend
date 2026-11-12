/* Overview Needs Attention */
import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";

import Panel from "@/AdminDashboard/components/Panel";

/** What is waiting on someone, each row a link straight to the work. */
export default function NeedsAttention({ data, loading, can }) {
  const items = data
    ? [
        { label: "Orders waiting for payment", n: data.pending, to: "/admin/orders", perm: "orders" },
        { label: "Return requests", n: data.inbox.returns, to: "/admin/orders?tab=returns", perm: "orders" },
        { label: "Reviews to approve", n: data.inbox.reviews, to: "/admin/products?tab=reviews", perm: "products" },
        { label: "New messages", n: data.inbox.messages, to: "/admin/messages", perm: "messages" },
      ].filter((t) => can(t.perm))
    : [];
  const open = items.filter((t) => t.n > 0);

  return (
    <Panel title="Needs attention" hint={open.length ? `${open.length} of ${items.length} queues have work` : undefined}>
      {loading ? (
        <div className="grid gap-2">{[0, 1, 2].map((i) => <span key={i} className="skel block h-12 rounded-[14px]" aria-hidden="true" />)}</div>
      ) : open.length === 0 ? (
        <p className="m-0 flex items-center gap-2.5 rounded-[14px] bg-success/10 px-4 py-3 text-sm text-ink-2">
          <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          Nothing is waiting on you.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-1 p-0">
          {items.map((t) => (
            <li key={t.label}>
              <Link
                to={t.to}
                className="group flex min-h-12 items-center gap-3 rounded-[14px] px-3 outline-none transition-[background-color] duration-200 ease-q hover:bg-cream-2 focus-visible:ring-2 focus-visible:ring-brand-300"
              >
                <span className={`w-9 font-display text-[1.35rem] font-bold tabular-nums ${t.n ? "text-brand-600" : "text-ink-4"}`}>{t.n}</span>
                <span className={`flex-1 text-sm ${t.n ? "text-ink-2" : "text-ink-4"}`}>{t.label}</span>
                <ArrowRight className="h-4 w-4 text-ink-4 transition-[transform,color] duration-200 ease-q group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
