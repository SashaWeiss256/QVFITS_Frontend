/* Delivery Policy */
import { STATUTORY, UPDATED, contactLine, ugx } from "./shop";

// Fees come from the admin settings, so this page always matches checkout.
// Uganda law behind it:
// - Electronic Transactions Act, 2011, s.27: an online order must be
//   fulfilled within 30 days unless agreed otherwise; if it cannot be, the
//   customer is told and refunded within 30 days.
// - Sale of Goods and Supply of Services Act, 2018, s.40(6): where goods are
//   handed to a carrier without the seller promising delivery to the door,
//   risk passes on handover (used for upcountry bus parcels); s.45: a buyer
//   who delays taking delivery bears the resulting costs.
// The waiting and holding times below are proposals for the client to confirm.
export const delivery = (s) => ({
  title: "Delivery",
  lede: "Where we deliver, what it costs, when it arrives, and what happens if no one is home.",
  updated: UPDATED,
  sections: [
    {
      id: "fees",
      heading: "Where we deliver and what it costs",
      blocks: [
        { table: {
          head: ["Option", "Fee"],
          rows: [
            ...(s.zones ?? []).map((z) => [z.etaDays ? `${z.name} (${z.etaDays} days)` : z.name, z.fee ? ugx(z.fee) : "Free"]),
            [`Orders over ${ugx(s.freeShippingOver)}`, "Free delivery"],
          ],
        } },
        "The full delivery fee is shown at checkout before you pay. We deliver within Uganda only for now. If you are abroad, message us and we will see what we can arrange, at your cost and risk.",
      ],
    },
    {
      id: "dispatch",
      heading: "When your order leaves us",
      blocks: [
        "We dispatch once your payment has been received and confirmed. Orders confirmed before 2 PM on a working day usually leave the same day in Kampala, and the next working day for upcountry.",
        "We will always deliver within 30 days of your order, as the Electronic Transactions Act, 2011 requires. If a piece is unexpectedly unavailable, we tell you straight away and refund you in full within 30 days, or offer an alternative if you prefer.",
      ],
    },
    {
      id: "kampala",
      heading: "Kampala and nearby",
      blocks: [
        "Our rider calls you before arriving. Please be reachable on the phone number you gave us. The rider will wait up to 15 minutes and call twice; after that the parcel returns to the showroom.",
        "We will arrange a second attempt with you. Because each trip has a cost, a second or later attempt, or a change of address after dispatch, is charged at the normal delivery fee.",
      ],
    },
    {
      id: "upcountry",
      heading: "Upcountry",
      blocks: [
        "Upcountry orders travel by courier or bus parcel service. We send you the service's receipt and tracking details, and you collect the parcel from their office with the name on the order.",
        "Once we hand your parcel to the service and send you its receipt, it travels at your risk. If anything goes wrong in transit, we will help you trace and claim it from the service.",
      ],
    },
    {
      id: "collection",
      heading: "Collecting from the showroom",
      blocks: [
        `Choose "Collect from the showroom" at checkout and we will message you when your order is ready at ${s.address} (${s.addressNote}). The showroom opens at ${s.opensAt}.`,
        "Bring your order reference. Someone else may collect for you if they have your reference and your name. We hold orders for 14 days.",
      ],
    },
    {
      id: "receiving",
      heading: "Receiving your order",
      blocks: [
        "Your order is yours, and your responsibility, once it is handed to you or to anyone at the address you gave who accepts it.",
        "Please open and check your parcel when it arrives. If anything is missing, wrong or damaged, tell us within 48 hours with photographs, so we can put it right quickly (see our returns policy).",
      ],
    },
    {
      id: "unclaimed",
      heading: "Unclaimed orders",
      blocks: [
        "If an order cannot be delivered after two attempts, or is not collected within 14 days of our message, we will contact you once more. If we still cannot reach you within a further 7 days, we may cancel the order and refund what you paid, less the delivery costs we incurred.",
      ],
    },
    {
      id: "address",
      heading: "Your details",
      blocks: [
        "Please check your name, phone number and address carefully before paying. We are not responsible for delays or loss caused by incorrect details, and redelivery to a corrected address is charged at the normal fee.",
      ],
    },
    {
      id: "delays",
      heading: "Delays outside our control",
      blocks: [
        "Heavy rain, road closures, public holidays, elections, strikes or courier disruption can slow deliveries. We will keep you informed, and if a delay becomes unreasonable you may cancel for a full refund.",
      ],
    },
    {
      id: "help",
      heading: "Questions",
      blocks: [contactLine(s), STATUTORY],
    },
  ],
});
