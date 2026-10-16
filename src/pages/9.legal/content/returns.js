/* Exchanges And Returns */
import { UPDATED, contactLine } from "./shop";

// From the shop's own FAQ: exchanges on unworn pieces with tags, swimwear
// only with the liner intact. The window (exchangeDays) is a placeholder in
// the admin settings until the shop confirms it.
export const returns = (s) => ({
  title: "Exchanges and returns",
  lede: "Wrong size, or not quite right? Here is how to swap it.",
  updated: UPDATED,
  sections: [
    {
      id: "exchanges",
      heading: "Exchanges",
      blocks: [
        `You can exchange a piece for another size, colour or item within ${s.exchangeDays} days of delivery, as long as it is:`,
        { list: [
          "Unworn and unwashed.",
          "In its original condition, with all tags attached.",
          "For swimwear: with the hygiene liner intact and unworn.",
        ] },
        "If the piece you want instead costs more, you pay the difference. If it costs less, we refund the difference to the way you paid.",
      ],
    },
    {
      id: "how-to",
      heading: "How to exchange",
      blocks: [
        { list: [
          `Message us first with your order reference: ${contactLine(s)}`,
          "Bring the piece to the showroom, or we will arrange a rider to collect it.",
          "We check it and send or hand over the replacement.",
        ] },
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      blocks: [
        "We do not refund a change of mind; we exchange instead. We refund in full when:",
        { list: [
          "A piece arrives faulty or damaged and we cannot replace it.",
          "We sent the wrong item and you would rather not wait for the right one.",
          "We cancel your order, for example because an item sold out.",
        ] },
        "Refunds go back to the way you paid (mobile money or card), usually within 7 working days of being agreed.",
      ],
    },
    {
      id: "faulty",
      heading: "Faulty items",
      blocks: [
        `If something arrives faulty or damaged, tell us within 48 hours of delivery with a photo. We will replace it or refund it, and we cover any delivery cost. ${contactLine(s)}`,
      ],
    },
    {
      id: "costs",
      heading: "Delivery costs on exchanges",
      blocks: [
        "Bringing an exchange to the showroom is free. If you would like us to collect and redeliver, the normal delivery fee applies, unless the exchange is because of our mistake or a fault.",
      ],
    },
  ],
});
