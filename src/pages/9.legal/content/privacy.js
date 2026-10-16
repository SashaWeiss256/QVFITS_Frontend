/* Privacy Policy */
import { UPDATED, contactLine } from "./shop";

// Written for Uganda's Data Protection and Privacy Act, 2019 and its 2021
// Regulations. To be reviewed by the shop's lawyer before launch, and the
// shop must register as a data controller with the Personal Data Protection
// Office (PDPO) (docs/README.md, launch blockers).
export const privacy = (s) => ({
  title: "Privacy policy",
  lede: `How ${s.brand} collects, uses and protects your personal information when you shop with us online, in the showroom or on WhatsApp.`,
  updated: UPDATED,
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        `${s.brand} (Quivogue) sells activewear, swim and lounge wear from ${s.address}, Uganda, and online at qvfits.com. We decide how your personal information is used, which makes us its data controller under the Data Protection and Privacy Act, 2019.`,
        `Questions about your information go to us directly: ${contactLine(s)}`,
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        { list: [
          "Order details: your name, phone number, email, delivery address and what you ordered.",
          "Account details, if you create an account: your name, email, phone, password (stored scrambled, never readable), saved addresses and saved pieces.",
          "Payment confirmation: whether a payment succeeded, its reference and amount. Your mobile money PIN and full card number go to our payment partner, never to us.",
          "Messages you send us through the contact form, WhatsApp or email.",
          "Newsletter sign-ups: your email address.",
          "Basic technical information our server receives with every visit, such as your device type and IP address, used to keep the site secure.",
        ] },
      ],
    },
    {
      id: "how-we-use-it",
      heading: "How we use it",
      blocks: [
        { list: [
          "To take, pack, deliver and support your order, including contacting you about it.",
          "To run your account, if you have one.",
          "To answer your questions and arrange exchanges.",
          "To send our newsletter, only if you signed up. Every email has a way to unsubscribe.",
          "To keep the site secure and prevent fraud.",
          "To meet our legal and tax obligations.",
        ] },
        "We never sell your personal information, and we do not use it for advertising profiles.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      blocks: [
        "Only the people who need it to serve you:",
        { table: {
          head: ["Who", "Why"],
          rows: [
            ["Payment partner", "To take mobile money (MTN, Airtel) and card payments securely."],
            ["Delivery riders and couriers", "Your name, phone and address, to deliver your order."],
            ["Hosting and email providers", "To run the site and send order emails; they store data on our behalf only."],
            ["Authorities", "Only where Ugandan law requires it."],
          ],
        } },
      ],
    },
    {
      id: "storage",
      heading: "Your device's storage",
      blocks: [
        "The site keeps a few things in your browser so it works: your bag, your saved pieces, your chosen currency and whether you are signed in. We do not use advertising or tracking cookies. Clearing your browser's site data removes all of it.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        "Order and payment records are kept for as long as Ugandan tax and accounting law requires. Account details are kept until you ask us to delete your account. Newsletter emails are deleted when you unsubscribe. Contact messages are kept only as long as needed to resolve them.",
      ],
    },
    {
      id: "security",
      heading: "How we protect it",
      blocks: [
        "The site runs over an encrypted connection (HTTPS). Passwords are stored scrambled. Only our staff who need your information to serve you can see it, each with their own login.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        "Under the Data Protection and Privacy Act, 2019 you can:",
        { list: [
          "Ask for a copy of the personal information we hold about you.",
          "Ask us to correct anything that is wrong.",
          "Ask us to delete your information, unless the law requires us to keep it.",
          "Object to, or withdraw your consent for, a particular use, such as the newsletter.",
        ] },
        `To use any of these rights, ${contactLine(s)} We will reply within 30 days. If you are not satisfied, you can complain to the Personal Data Protection Office (PDPO) in Uganda.`,
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: ["Our site is not aimed at children under 18, and we do not knowingly collect their information. A parent or guardian should place orders for a child."],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: ["If we change this policy, we will update the date at the top of this page. Significant changes will also be shown on the site."],
    },
  ],
});
