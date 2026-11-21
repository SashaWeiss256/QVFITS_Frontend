/* Transaction Totals */
import { ArrowDownLeft, ArrowUpRight, CircleSlash, Clock, XCircle } from "lucide-react";

import StatCard from "@/AdminDashboard/components/StatCard";

/** Over the rows in view, so a tab or filter totals too (after artistry360's TransactionTotals). */
export default function TxTotals({ rows, money, loading }) {
  const of = (status, type) => rows.filter((t) => t.status === status && (!type || t.type === type));
  const sum = (list) => list.reduce((n, t) => n + t.amount, 0);
  const taken = of("succeeded", "payment");
  const refunded = of("succeeded", "refund");
  const pending = of("pending");
  const failed = of("failed");
  const abandoned = of("abandoned");
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <section aria-label="Totals" className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard loading={loading} label="Taken" icon={ArrowDownLeft} value={money(sum(taken))} note={`${plural(taken.length, "payment")} · net ${money(sum(taken) - sum(refunded))}`} />
      <StatCard loading={loading} label="Refunded" icon={ArrowUpRight} value={money(sum(refunded))} note={plural(refunded.length, "refund")} />
      <StatCard loading={loading} label="Pending" icon={Clock} value={money(sum(pending))} note={`${pending.length} awaiting payment`} />
      <StatCard loading={loading} label="Failed" icon={XCircle} value={failed.length} note={`${money(sum(failed))} declined`} />
      {/* Never finished, not turned down: not counted with the failures. */}
      <StatCard loading={loading} label="Abandoned" icon={CircleSlash} value={abandoned.length} note={`${money(sum(abandoned))} never paid`} />
    </section>
  );
}
