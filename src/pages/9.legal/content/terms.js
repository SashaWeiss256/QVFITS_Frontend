/* Terms Of Sale */
import { UPDATED, contactLine, ugx } from "./shop";

// To be reviewed by the shop's lawyer before launch (docs/README.md).
export const terms = (s) => ({
  title: "Terms of sale",
  lede: `The terms that apply when you buy from ${s.brand} on qvfits.com. By placing an order you agree to them.`,
  updated: UPDATED,
  sections: [
    {
      id: "about-us",
      heading: "About us",
      blocks: [`qvfits.com is run by ${s.brand} (Quivogue), ${s.address}, Uganda. ${contactLine(s)}`],
    },
    {
      id: "products",
      heading: "Our products",
      blocks: [
        "We describe and photograph every piece as accurately as we can. Colours can look slightly different on different screens, and some photographs are styling references rather than the exact item. Check the size guide before ordering; our team is happy to help with fit on WhatsApp.",
      ],
    },
    {
      id: "prices",
      heading: "Prices and currency",
      blocks: [
        "All prices are in Uganda Shillings (UGX) and include any taxes that apply. Prices shown in other currencies are approximate conversions for your convenience; you are always charged in UGX.",
        "Delivery is added at checkout (see our delivery policy). If a price on the site is clearly wrong, we will contact you before your order goes ahead, and you can cancel for a full refund.",
      ],
    },
    {
      id: "orders",
      heading: "Placing an order",
      blocks: [
        "You can order as a guest or with an account. When you place an order you will receive an order reference. Your order is accepted when we confirm it and your payment has been received.",
        "We may decline or cancel an order if an item is out of stock, if payment fails, or if we suspect fraud. If we cancel after you have paid, we refund you in full.",
      ],
    },
    {
      id: "payment",
      heading: "Payment",
      blocks: [
        { list: [
          "Mobile money: MTN MoMo and Airtel Money.",
          "Visa and Mastercard.",
          "Ordering on WhatsApp, where our team confirms payment with you directly.",
        ] },
        "Online payments are processed by our payment partner. We never see or store your PIN or full card number.",
      ],
    },
    {
      id: "delivery",
      heading: "Delivery",
      blocks: [
        `We deliver to ${(s.zones ?? []).filter((z) => !z.collect).map((z) => `${z.name} (${ugx(z.fee)})`).join(", ")}, free on orders over ${ugx(s.freeShippingOver)}, or you can collect from the showroom at no charge. Full details are in our delivery policy.`,
      ],
    },
    {
      id: "exchanges",
      heading: "Exchanges and returns",
      blocks: [
        `Unworn pieces with their tags on can be exchanged within ${s.exchangeDays} days of delivery. Swimwear can only be exchanged if the hygiene liner is intact. Faulty items are always put right. Full details are in our exchanges and returns policy.`,
      ],
    },
    {
      id: "accounts",
      heading: "Your account",
      blocks: ["If you create an account, keep your password private; you are responsible for orders placed with it. Tell us straight away if you think someone else has used it."],
    },
    {
      id: "liability",
      heading: "Our responsibility to you",
      blocks: [
        "Nothing in these terms limits your rights as a consumer under Ugandan law. We are responsible for delivering what you ordered as described. We are not responsible for delays caused by events outside our control, such as severe weather or road closures; we will keep you informed if one affects your order.",
      ],
    },
    {
      id: "law",
      heading: "Governing law",
      blocks: [
        "These terms are governed by the laws of Uganda, including the Electronic Transactions Act, 2011. If something goes wrong, please contact us first; most problems are solved quickly. Any dispute we cannot resolve together will be handled by the courts of Uganda.",
      ],
    },
  ],
});
