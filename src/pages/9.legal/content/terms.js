/* Terms Of Sale */
import { STATUTORY, UPDATED, contactLine, legalIdentity, ugx } from "./shop";

// Written for Uganda law: the Electronic Transactions Act, 2011 (s.24, the
// details an online seller must show; s.25, the 7-day right to cancel; s.27,
// 30-day fulfilment; s.28, consumer rights cannot be excluded), the Sale of
// Goods and Supply of Services Act, 2018 (s.67, implied terms cannot be
// excluded) and the Data Protection and Privacy Act, 2019. Terms that protect
// the shop are written within those limits. To be checked by the shop's
// lawyer before launch (docs/README.md).
export const terms = (s) => ({
  title: "Terms of sale",
  lede: `The agreement between you and ${s.brand} whenever you buy from us online, on WhatsApp or in the showroom. Please read it before you order; by placing an order you accept it.`,
  updated: UPDATED,
  sections: [
    {
      id: "about-us",
      heading: "Who we are",
      blocks: [
        `qvfits.com and the QVFITS showroom are run by ${legalIdentity(s)}, of ${s.address}, Kampala, Uganda. Our address for legal notices is the same. ${contactLine(s)}`,
      ],
    },
    {
      id: "eligibility",
      heading: "Who can buy",
      blocks: [
        "You must be 18 or older, or ordering with the permission of a parent or guardian. We sell to individuals for their own use. We may limit quantities per customer, or decline orders that appear to be for resale.",
      ],
    },
    {
      id: "products",
      heading: "Our pieces",
      blocks: [
        "We describe and photograph every piece as accurately as we can, and each carries an honest fit note. Colours can look slightly different on different screens, and some photographs show styling rather than the exact item sold. Please use the size guide; our team is happy to advise on fit before you order.",
        "Pieces are made in small runs and stock is limited. Adding a piece to your bag does not reserve it.",
      ],
    },
    {
      id: "prices",
      heading: "Prices",
      blocks: [
        "All prices are in Uganda Shillings (UGX) and include any taxes that apply. Prices in other currencies are approximate and for guidance only; you are always charged in UGX.",
        "Delivery is shown separately at checkout before you pay. We may change prices at any time, but not for an order we have already confirmed.",
        "Occasionally a price may be shown wrongly. If the correct price is higher, we will contact you before dispatch and you may pay the correct price or cancel for a full refund. We are not bound to sell at a price that is obviously a mistake.",
      ],
    },
    {
      id: "orders",
      heading: "How a contract is made",
      blocks: [
        "Before you pay, checkout shows your full order, delivery cost and total, so you can review and correct it. After you pay you receive an order reference; this confirms we have your order, not that we have accepted it.",
        "Our contract with you begins when we confirm your order and payment, by message or email. We may decline or cancel an order before then, for example if a piece has sold out, payment fails or is reversed, details cannot be verified, or we reasonably suspect fraud or resale. If we cancel after you have paid, we refund you in full.",
      ],
    },
    {
      id: "payment",
      heading: "Payment",
      blocks: [
        { list: [
          "Mobile money: MTN MoMo and Airtel Money.",
          "Visa and Mastercard.",
          "On WhatsApp, our team confirms the amount and payment details with you directly. We will only ever ask you to pay to the official numbers shown on this site.",
        ] },
        "Orders are paid in full before dispatch. Online payments (MTN Mobile Money, Airtel Money and card) are processed by Pesapal; we never see or store your PIN or full card number.",
        "If a payment is reversed or charged back after delivery without a valid reason, the amount becomes a debt you owe us, and we may recover it, together with reasonable costs.",
      ],
    },
    {
      id: "offers",
      heading: "Discount codes and offers",
      blocks: [
        { list: [
          "One code per order, unless the offer says otherwise. Codes have no cash value and cannot be applied to past orders.",
          "Codes are personal unless published by us for everyone. Codes shared, sold or obtained by creating several accounts may be cancelled.",
          "Sale prices cannot be combined with a code unless the offer says so. Discounts apply to the price of the pieces only, not to delivery or to any taxes.",
          "Sale pieces bought in the showroom are final sale. Sale pieces bought online keep the 7 day right to cancel described in our returns policy.",
          "We may end an offer at any time, but we will honour it for orders already confirmed.",
          "If an order uses an offer in a way that breaks its terms, we may cancel the order or charge the difference before dispatch.",
        ] },
      ],
    },
    {
      id: "cancel",
      heading: "Changing or cancelling your order",
      blocks: [
        "Message us as soon as possible. Before dispatch we can usually change or cancel an order free of charge. After dispatch, your 7-day right to cancel online orders applies (see our returns policy).",
      ],
    },
    {
      id: "delivery",
      heading: "Delivery",
      blocks: [
        `We deliver across Uganda, free on orders over ${ugx(s.freeShippingOver)}, or you can collect from the showroom at no charge. Every order is delivered within 30 days, or we refund you. Times, costs, missed deliveries and when a parcel becomes your responsibility are set out in our delivery policy.`,
      ],
    },
    {
      id: "returns",
      heading: "Returns, exchanges and faults",
      blocks: [
        `Online orders may be cancelled within 7 days of receipt for a refund; any piece may be exchanged within ${s.exchangeDays} days; faulty pieces are always put right. Pieces must come back unworn, unwashed and with tags and hygiene liners in place. The full terms are in our returns policy, which forms part of these terms.`,
      ],
    },
    {
      id: "accounts",
      heading: "Your account",
      blocks: [
        "Keep your password private. You are responsible for orders placed with your account until you tell us it may have been misused. We may suspend or close an account used for fraud, abuse of offers or returns, or abuse of our staff.",
      ],
    },
    {
      id: "content",
      heading: "Our designs, photographs and name",
      blocks: [
        "The QVFITS and Quivogue names, logos, designs, photographs, videos and text on this site and our social channels belong to us. You may not copy, reproduce or use them to sell goods, or present other goods as ours, without our written permission.",
        `If you tag ${s.instagramHandle ?? "us"} or send us photos of yourself in QVFITS, we will always ask before reposting them, and you may ask us to take them down at any time.`,
      ],
    },
    {
      id: "reviews",
      heading: "Reviews",
      blocks: [
        "Reviews must be your own honest experience of a piece you bought. We publish genuine reviews, positive or critical, but we may decline any that are abusive, misleading, contain personal details or advertise something else.",
      ],
    },
    {
      id: "liability",
      heading: "Our responsibility to you",
      blocks: [
        "We are responsible for supplying pieces that match their description, are of satisfactory quality and are fit for their normal use, as the law requires. If we fail to do so, our remedies are those in our returns policy and the law.",
        "As far as the law allows, we are not responsible for losses that were not foreseeable, for business losses, or for damage caused by wearing or caring for a piece against its instructions, and our total responsibility for any order is limited to the amount you paid for it. This does not limit our responsibility for death or injury caused by our negligence, or for fraud.",
      ],
    },
    {
      id: "beyond-control",
      heading: "Events beyond our control",
      blocks: [
        "We are not responsible for delays or failures caused by events we cannot reasonably control, such as severe weather, floods, fire, civil unrest, government restrictions, internet or power outages, or the failure of a payment or delivery partner. We will tell you, and if the delay is long you may cancel for a full refund.",
      ],
    },
    {
      id: "disputes",
      heading: "If something goes wrong",
      blocks: [
        `Please talk to us first: ${contactLine(s)} Most problems are solved the same day. If we cannot agree, either of us may refer the matter to mediation at the Centre for Arbitration and Dispute Resolution (CADER) in Kampala before going to court.`,
        "These terms are governed by the laws of Uganda, and the courts of Uganda decide any dispute.",
      ],
    },
    {
      id: "general",
      heading: "General",
      blocks: [
        "We may update these terms from time to time; the version on this page when you place your order is the one that applies to it. If any part of these terms is found to be unenforceable, the rest still applies. If we do not enforce a term straight away, we may still enforce it later.",
        STATUTORY,
      ],
    },
  ],
});
