/* Status Chip */
import { cn } from "@/utils/cn";
import { statusLabel } from "@/utils/orderStatus";

const TONE = {
  pending: "bg-sand-100 text-ink-2",
  paid: "bg-brand-100 text-brand-600",
  packed: "bg-brand-100 text-brand-600",
  out_for_delivery: "bg-teal-100 text-teal-500",
  delivered: "bg-teal-100 text-teal-500",
  cancelled: "bg-beige text-ink-3",
  exchanged: "bg-beige text-ink-2",
};

export default function StatusChip({ status }) {
  return (
    <span className={cn("inline-flex rounded-r-pill px-2.5 py-1 text-xs font-semibold", TONE[status])}>
      {statusLabel(status)}
    </span>
  );
}
