/* Transaction Fields */
// One vocabulary for the Transactions page (after artistry360's paymentFields).

/** Every status a transaction can end in, in tab order. */
export const TX_STATUS = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
  // Closed unpaid: the shopper left the payment page or the order's hold ran out. Not a failure.
  abandoned: "Abandoned",
  // Paid, then refunded or charged back by the gateway.
  reversed: "Reversed",
};

/** Money that never landed (or went back) is struck through. */
const STRUCK = "text-ink-4 line-through decoration-1";
export const amountTone = (t) =>
  ["failed", "abandoned", "reversed"].includes(t.status) ? STRUCK : t.status === "pending" ? "text-ink-3" : t.type === "refund" ? "text-warn" : "";

/** Not settled yet, or turned down: the gateway can be asked again. */
export const canCheck = (t) => !t.derived && Boolean(t.reference) && ["pending", "failed", "abandoned"].includes(t.status);

/**
 * Until the gateway reports abandoned payments itself, a shop order that was
 * cancelled while still unpaid (its hold ran out, or the shopper cancelled)
 * stands in as one, unless a stored transaction already covers that order.
 */
export function abandonedFromOrders(orders, transactions) {
  const covered = new Set(transactions.map((t) => t.orderId));
  return orders
    .filter((o) => (!o.source || o.source === "web") && o.status === "cancelled" && o.paymentStatus === "unpaid" && !covered.has(o.id))
    .map((o) => {
      const cancel = [...(o.history ?? [])].reverse().find((e) => e.status === "cancelled");
      return {
        id: `ord-${o.id}`,
        orderId: o.id,
        orderRef: o.ref,
        type: "payment",
        method: o.payment,
        amount: o.total,
        status: "abandoned",
        reference: "",
        reason: cancel?.note || "Cancelled before payment",
        derived: true,
        createdAt: cancel?.at ?? o.createdAt,
      };
    });
}
