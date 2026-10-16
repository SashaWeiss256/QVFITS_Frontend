/* Order Message */

const AREA = { kampala: "Kampala", upcountry: "upcountry" };
const PAY = { mtn: "MTN Mobile Money", airtel: "Airtel Money", card: "Card", whatsapp: "Confirm on WhatsApp" };

/**
 * The order as a message for the team. Always in shillings, whatever the
 * shopper was browsing in: the shop settles in UGX, and a dollar total would
 * have to be converted back by hand at the other end.
 */
export function orderMessage(order, { moneyBase, money, currency }) {
  const lines = order.lines.map((l) => `• ${l.name}: ${l.color}, ${l.size} ×${l.qty}, ${moneyBase(l.price * l.qty)}`).join("\n");
  const seenIn = currency.code === "UGX" ? "" : `\n\n(I was viewing prices in ${currency.code}: about ${money(order.total)}.)`;
  return [
    "Hi QV FITS! I'd like to place an order",
    "",
    `Ref: ${order.ref}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    order.region === "pickup" ? "Collecting from the showroom" : `Deliver to (${AREA[order.region]}): ${order.address}`,
    `Paying by: ${PAY[order.payment]}`,
    order.note ? `Note: ${order.note}` : "",
    "",
    lines,
    "",
    `Subtotal: ${moneyBase(order.subtotal)}`,
    order.discount ? `Discount: −${moneyBase(order.discount)}` : "",
    `Delivery: ${order.delivery === 0 ? "Free" : moneyBase(order.delivery)}`,
    `Total: ${moneyBase(order.total)}${seenIn}`,
  ]
    .filter((x, i, all) => x !== "" || all[i - 1] !== "")
    .join("\n");
}
