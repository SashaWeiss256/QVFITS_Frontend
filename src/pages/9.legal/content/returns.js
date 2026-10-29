/* Returns, Exchanges And Refunds */
import { STATUTORY, UPDATED, contactLine } from "./shop";

// Written for Uganda law and to protect the shop from misuse:
// - Electronic Transactions Act, 2011, s.25: a consumer who buys online may
//   cancel within 7 days of receiving the goods, pays only the direct cost of
//   sending them back, and is refunded within 30 days. s.28: this right cannot
//   be taken away by any term, so "no refunds" is void for online orders.
// - Sale of Goods and Supply of Services Act, 2018, ss.47 to 49: for a faulty
//   piece the seller may first repair or replace it; a refund follows only if
//   that is impossible or not done in reasonable time.
// - Showroom purchases have no change-of-mind right in law, so they are
//   exchange or credit only (faults always put right).
// exchangeDays comes from Settings. To be checked by the shop's lawyer.
export const returns = (s) => ({
  title: "Returns, exchanges and refunds",
  lede: "We want every piece to be the right one. If it is not, here is exactly how to send it back or swap it, and what we ask of you in return.",
  updated: UPDATED,
  sections: [
    {
      id: "summary",
      heading: "In short",
      blocks: [
        { list: [
          "Bought online or on WhatsApp: you may cancel and return within 7 days of receiving your order, for a refund.",
          `Bought anywhere: you may exchange within ${s.exchangeDays} days of receiving it, for another size, colour or piece.`,
          "Pieces must come back unworn, unwashed, with every tag attached and in their original packaging. Swimwear and bodysuits must have the hygiene liner in place.",
          "Faulty or wrong items are always put right, at our cost.",
          "Sale pieces bought online keep your 7 day right to cancel. Sale pieces bought in the showroom are final sale, unless they are faulty.",
        ] },
      ],
    },
    {
      id: "online",
      heading: "Online and WhatsApp orders: your 7-day right to cancel",
      blocks: [
        "Under the Electronic Transactions Act, 2011, if you bought from us online or through WhatsApp, Instagram or email, you may cancel your order within 7 days of receiving it, without giving a reason.",
        { list: [
          "Tell us within those 7 days, in writing (WhatsApp or email is fine), with your order reference.",
          "Send or bring the pieces back within 7 days of telling us. You pay only the direct cost of returning them; bringing them to the showroom costs nothing.",
          "We inspect every returned piece, then refund the price you paid, including the standard delivery fee, within 30 days of your cancellation. In practice we aim to refund within 7 working days of receiving the pieces.",
        ] },
        "If you chose a faster or special delivery option, we refund only the cost of our standard delivery.",
      ],
    },
    {
      id: "condition",
      heading: "The condition we need pieces back in",
      blocks: [
        "Please try pieces on as you would in a fitting room: briefly, indoors, over your own underwear. We ask that every returned or exchanged piece is:",
        { list: [
          "Unworn beyond trying on, and unwashed.",
          "Free of make-up, deodorant, fake tan, perfume, smoke, pet hair or any other mark or smell.",
          "Returned with every tag still attached and in its original packaging.",
          "For swimwear, bodysuits and briefs: with the hygiene liner intact and unremoved.",
          "Returned together with any free gift or bundle item that came with it.",
        ] },
        "As far as the law allows, if a piece comes back worn, washed, marked, damaged or without its tags or liner, we will deduct the loss in its value from your refund, or offer to send it back to you at your cost instead. We will show you photographs of what we found.",
      ],
    },
    {
      id: "exchanges",
      heading: "Exchanges",
      blocks: [
        `You may exchange any piece in the condition above within ${s.exchangeDays} days of receiving it, for another size, colour or piece, subject to stock.`,
        { list: [
          "If the new piece costs more, you pay the difference. If it costs less, we give the difference as store credit.",
          "Each piece can be exchanged once. A piece you received in exchange can be swapped again only if it is faulty.",
          "Bring exchanges to the showroom at no charge, or we can arrange a rider to collect and redeliver for the normal delivery fee.",
        ] },
      ],
    },
    {
      id: "showroom",
      heading: "Showroom purchases",
      blocks: [
        `Pieces bought and tried on in the showroom cannot be returned for a refund because you changed your mind. You may exchange them, or take store credit, within ${s.exchangeDays} days, in the condition above. Faulty pieces are always put right (see below).`,
      ],
    },
    {
      id: "sale",
      heading: "Sale pieces and offers",
      blocks: [
        "Sale pieces are real pieces at a lower price, made and checked to the same standard as everything else we sell. What changes is how returns work, and that depends on where you bought them.",
        { list: [
          "Online and WhatsApp sale orders: you keep your 7 day right to cancel and return, as set out above. The law gives you this right and we will always honour it.",
          "Showroom sale purchases: these are final sale. You have tried the piece on and chosen it at the reduced price, so it cannot be returned, exchanged or credited because you changed your mind. We will still put right any fault, at our cost.",
          "Sale pieces are marked on the product page and on your order confirmation, so you always know before you pay.",
          "Sale prices apply while stock lasts and may end at any time. An order we have confirmed always keeps the price shown when you paid.",
        ] },
        "If you return part of an order that qualified for an offer (for example a bundle price or free delivery), we refund what you paid less the value of the offer you no longer qualify for, as far as the law allows.",
        "Nothing in this section limits your rights for faulty or wrongly described pieces, which are the same for sale and full price pieces.",
      ],
    },
    {
      id: "faulty",
      heading: "Faulty or wrong items",
      blocks: [
        "Please check your order as soon as it arrives. If a piece is damaged, faulty or not what you ordered:",
        { list: [
          "Tell us within 48 hours of delivery for anything visible on arrival, with photographs and your order reference.",
          "For a fault that only shows later, tell us as soon as you notice it.",
          "We will repair or replace the piece within a reasonable time, at our cost. If we cannot, we refund you in full, including delivery.",
        ] },
        "These are not faults: normal wear, pilling from friction (for example from bags or rough surfaces), colour change from chlorine, sunscreen or oils, and damage from washing or drying against the care label, from alterations or from misuse.",
      ],
    },
    {
      id: "refunds",
      heading: "How refunds are paid",
      blocks: [
        { list: [
          "Refunds go back to the way you paid: to the same mobile money number, or to the same card. We do not refund in cash or to a different person.",
          "We refund the amount we received. Charges your mobile money provider or bank made to you are not refundable by us.",
          "Store credit is valid for 12 months, can be used online or in the showroom, and cannot be exchanged for cash.",
        ] },
      ],
    },
    {
      id: "sending-back",
      heading: "Sending pieces back",
      blocks: [
        "Return parcels are your responsibility until they reach us, so please use a trackable service and keep your receipt. We cannot refund a parcel that does not arrive. Only return pieces bought from QVFITS; anything else will be sent back at your cost.",
      ],
    },
    {
      id: "fair-use",
      heading: "Fair use",
      blocks: [
        "Our returns policy exists for honest mistakes of size and taste. To keep it fair for everyone, we may decline future orders, or offer exchanges only, on any account or phone number that shows a pattern of returning worn pieces, an unusually high rate of returns, or false claims of loss, damage or non-delivery. Fraudulent claims may be reported to the Uganda Police Force.",
      ],
    },
    {
      id: "help",
      heading: "Starting a return",
      blocks: [`${contactLine(s)} Have your order reference ready.`, STATUTORY],
    },
  ],
});
