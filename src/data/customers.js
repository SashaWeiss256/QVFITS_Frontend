/* Customer Accounts (mock only) */

// One demo shopper for /login while mocks are on. Sign-ups made in the browser
// are added to the collection store beside it.
export const customerSeed = [
  {
    id: "cus_demo",
    name: "Demo Shopper",
    email: "shopper@qvfits.com",
    phone: "+256 700 000 000",
    password: "demo123",
    addresses: [
      { id: "adr_home", label: "Home", region: "kampala", address: "Plot 1, Kisementi, Kampala", phone: "+256 700 000 000" },
    ],
    wishlist: ["sculpt-seamless-set"],
    createdAt: "2026-10-01T09:00:00.000Z",
  },
];
