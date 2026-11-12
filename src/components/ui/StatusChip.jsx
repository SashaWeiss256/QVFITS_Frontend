/* Status Chip */
import { cn } from "@/utils/cn";
import { statusLabel } from "@/utils/orderStatus";

// Colour by stage: neutral while waiting, brand while in progress, teal once
// it is done or live, muted for things that ended another way.
const WAITING = "bg-sand-100 text-ink-2";
const MOVING = "bg-brand-100 text-brand-600";
const DONE = "bg-teal-100 text-teal-500";
const ENDED = "bg-beige text-ink-3";
const BAD = "bg-[#f6e3de] text-warn";

const TONE = {
  pending: WAITING, unpaid: WAITING, requested: WAITING, draft: WAITING, new: MOVING, invited: WAITING,
  paid: MOVING, packed: MOVING, approved: MOVING, received: MOVING, read: WAITING,
  out_for_delivery: DONE, delivered: DONE, succeeded: DONE, active: DONE, replied: DONE,
  cancelled: ENDED, exchanged: ENDED, refunded: ENDED, partially_refunded: ENDED, archived: ENDED, hidden: ENDED, inactive: ENDED,
  rejected: BAD, failed: BAD, suspended: BAD,
  // Emails in the Outbox.
  queued: MOVING, sent: DONE, held: WAITING, no_email: ENDED,
};

export default function StatusChip({ status, label }) {
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", TONE[status] ?? WAITING)}>
      {label ?? statusLabel(status)}
    </span>
  );
}
