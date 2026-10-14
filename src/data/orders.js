/* Orders (mock only) */

// Sample orders so the account and admin order screens have rows to show.
// Prices follow the placeholder catalogue in shop.js.
export const orderSeed = [
  {
    id: "ord_1001",
    ref: "QV-1001",
    customerId: "cus_demo",
    name: "Demo Shopper",
    phone: "+256 700 000 000",
    email: "shopper@qvfits.com",
    region: "kampala",
    address: "Plot 1, Kisementi, Kampala",
    lines: [{ productId: "sculpt-seamless-set", name: "Sculpt Seamless Set", size: "M", color: "Ivory", qty: 1, price: 195000 }],
    subtotal: 195000,
    delivery: 15000,
    discount: 0,
    total: 210000,
    payment: "mtn",
    status: "delivered",
    createdAt: "2026-10-03T11:20:00.000Z",
  },
];

export const discountSeed = [
  { id: "dsc_welcome", code: "WELCOME10", percent: 10, active: true },
];

export const subscriberSeed = [];
