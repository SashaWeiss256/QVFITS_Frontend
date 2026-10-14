/* Delivery Policy */
import { UPDATED, contactLine, ugx } from "./shop";

// Fees come from the admin settings, so this page always matches checkout.
// The fees are still placeholders until the shop confirms them.
export const delivery = (s) => ({
  title: "Delivery",
  lede: "Where we deliver, what it costs, and when it arrives.",
  updated: UPDATED,
  sections: [
    {
      id: "fees",
      heading: "Where we deliver and what it costs",
      blocks: [
        { table: {
          head: ["Option", "Fee"],
          rows: [
            ["Kampala", ugx(s.kampalaDelivery)],
            ["Upcountry (outside Kampala)", ugx(s.upcountryDelivery)],
            ["Collect from the showroom", "Free"],
            [`Orders over ${ugx(s.freeShippingOver)}`, "Free delivery"],
          ],
        } },
        "The delivery fee is shown at checkout before you pay. We do not currently ship outside Uganda; message us if you are abroad and we will see what we can do.",
      ],
    },
    {
      id: "timing",
      heading: "When it arrives",
      blocks: [
        "We confirm the delivery time when we confirm your order. Kampala orders usually go out with a rider; upcountry orders go by courier or bus parcel service, and we send you the details to collect or track it.",
      ],
    },
    {
      id: "collection",
      heading: "Collecting from the showroom",
      blocks: [
        `Choose "Collect from the showroom" at checkout and we will message you when your order is ready at ${s.address} (${s.addressNote}). The showroom opens at ${s.opensAt}. Bring your order reference.`,
      ],
    },
    {
      id: "receiving",
      heading: "Receiving your order",
      blocks: [
        "Please check your parcel when it arrives. If anything is missing, wrong or damaged, tell us within 48 hours so we can put it right.",
        "If our rider cannot reach you, we will call to arrange another time. A second failed delivery may carry another delivery fee.",
      ],
    },
    {
      id: "help",
      heading: "Questions",
      blocks: [contactLine(s)],
    },
  ],
});
