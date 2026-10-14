/* Order Status */

// The order lifecycle, in order, with the words a shopper sees.
export const ORDER_STATUSES = [
  { id: "pending", label: "Awaiting payment" },
  { id: "paid", label: "Paid" },
  { id: "packed", label: "Packed" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "exchanged", label: "Exchanged" },
];

export const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label ?? id;
