/* Order Message */


/**
 * The order as a message for the team. Always in shillings, whatever the
 * shopper was browsing in: the shop settles in UGX, and a dollar total would
 * have to be converted back by hand at the other end.
 */
export function orderMessage(order, { moneyBase, money, currency, settings, methods = [] }) {
  const zone = settings?.zones?.find((z) => z.id === order.region);
  const pay = methods.find((m) => m.id === order.payment)?.label ?? order.payment;
  const lines = order.lines.map((l) => `• ${l.name}: ${l.color}, ${l.size} ×${l.qty}, ${moneyBase(l.price * l.qty)}`).join("\n");
  const seenIn = currency.code === "UGX" ? "" : `\n\n(I was viewing prices in ${currency.code}: about ${money(order.total)}.)`;
  return [
    "Hi QVFITS! I'd like to place an order",
    "",
    `Ref: ${order.ref}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    zone?.collect ? "Collecting from the showroom" : `Deliver to (${zone?.name ?? order.region}): ${order.address}`,
    `Paying by: ${pay}`,
    order.note ? `Note: ${order.note}` : "",
    "",
    lines,
    "",
    `Subtotal: ${moneyBase(order.subtotal)}`,
    order.discount ? `Discount: -${moneyBase(order.discount)}${order.discountCode ? ` (${order.discountCode})` : ""}` : "",
    `Delivery: ${order.delivery === 0 ? "Free" : moneyBase(order.delivery)}`,
    `Total: ${moneyBase(order.total)}${seenIn}`,
  ]
    .filter((x, i, all) => x !== "" || all[i - 1] !== "")
    .join("\n");
}
