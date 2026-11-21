/* Transaction Columns */
import StatusChip from "@/components/ui/StatusChip";
import { formatDateTime } from "@/utils/format";
import CheckButton from "./CheckButton";
import { amountTone, canCheck } from "./txFields";

export const txColumns = ({ methodLabel, money }) => [
  { key: "createdAt", label: "When", sort: (t) => t.createdAt, render: (t) => formatDateTime(t.createdAt) },
  { key: "orderRef", label: "Order", render: (t) => <strong className="font-display">{t.orderRef}</strong> },
  { key: "type", label: "Type", render: (t) => (t.type === "refund" ? "Refund" : "Payment") },
  { key: "method", label: "Method", render: (t) => methodLabel(t.method) },
  { key: "reference", label: "Reference", render: (t) => t.reference || <span className="text-ink-4">None</span> },
  {
    key: "status",
    label: "Status",
    // Pending, failed or abandoned at the gateway: Check asks it again. The reason shows under the chip.
    render: (t) => (
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-2">
          <StatusChip status={t.status} />
          {canCheck(t) && <CheckButton reference={t.reference} />}
        </span>
        {t.reason && <span className="max-w-64 text-xs leading-snug text-ink-4">{t.reason}</span>}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    sort: (t) => t.amount,
    render: (t) => (
      <span className={amountTone(t)}>
        {t.type === "refund" ? "-" : ""}
        {money(t.amount)}
      </span>
    ),
  },
];
