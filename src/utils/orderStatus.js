/* Statuses */

// The order lifecycle, in order, with the words a shopper sees.
export const ORDER_STATUSES = [
  { id: "pending", label: "Awaiting payment" },
  { id: "paid", label: "Paid" },
  { id: "packed", label: "Packed" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "exchanged", label: "Exchanged" },
  { id: "refunded", label: "Refunded" },
];

// Every other status a chip can show: returns, payments, products, messages, staff.
const OTHER = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  received: "Received",
  unpaid: "Unpaid",
  partially_refunded: "Part refunded",
  succeeded: "Succeeded",
  failed: "Failed",
  draft: "Draft",
  active: "Active",
  archived: "Archived",
  new: "New",
  read: "Read",
  replied: "Replied",
  invited: "Invited",
  suspended: "Suspended",
  hidden: "Hidden",
  inactive: "Off",
};

// Fall back to the raw id so an unknown status still shows something.
export const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label ?? OTHER[id] ?? id;
