/* Privacy Policy */
import { UPDATED, contactLine, legalIdentity } from "./shop";

// Written for Uganda's Data Protection and Privacy Act, 2019 and its 2021
// Regulations: registration with the PDPO (reg. 13; s.pdpoRegNo shows once
// the shop has it), transfers abroad (s.19), breach notification (s.23),
// retention (tax records 5 years under the Tax Procedures Code Act, 2014),
// children (s.8) and direct marketing opt-out. To be reviewed by the shop's lawyer before launch, and the
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
        `${legalIdentity(s)} sells activewear, swim and lounge wear from ${s.address}, Uganda, and online at qvfits.com. We decide how your personal information is used, which makes us its data controller under the Data Protection and Privacy Act, 2019${s.pdpoRegNo ? `, registered with the Personal Data Protection Office under number ${s.pdpoRegNo}` : ""}.`,
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
          "Payment confirmation: whether a payment succeeded, its reference and amount. Your mobile money PIN and full card number go to Pesapal, our payment processor, never to us.",
          "Messages you send us through the contact form, WhatsApp or email.",
          "Newsletter sign-ups: your email address, when and where you signed up, the words you agreed to, and when you confirmed.",
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
          "To spot misuse of offers and returns, so our policies stay fair for everyone. A person always reviews these cases; nothing is decided by a machine alone.",
        ] },
        "We never sell your personal information, and we do not use it for advertising profiles. We contact you about your order by phone, WhatsApp, SMS or email. We send marketing only if you asked for it, and you can stop it at any time by replying STOP, unsubscribing, or telling us.",
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
            ["Pesapal", "To take mobile money (MTN, Airtel) and card payments securely."],
            ["Delivery riders and couriers", "Your name, phone and address, to deliver your order."],
            ["Hosting and email providers", "To run the site and send order emails; they store data on our behalf only."],
            ["Authorities", "Only where Ugandan law requires it, or to report fraud."],
          ],
        } },
        "Some of these providers store data on servers outside Uganda. Under section 19 of the Act, we only use providers in countries with protection at least equal to Uganda's, or bound by contract to protect your data to that standard. By using the site you consent to this.",
      ],
    },
    {
      id: "storage",
      heading: "Cookies and your device's storage",
      blocks: [
        "The site keeps a few things in your browser. On your first visit we ask what you agree to, and you can change your answer any time from Cookie settings at the foot of every page. Your choice is saved with its date.",
        { table: {
          head: ["Kind", "What it does", "Needs your yes"],
          rows: [
            ["Essential", "Your bag, saved pieces, sign-in, chosen currency and your cookie choice. The shop cannot work without these.", "No, always on"],
            ["Analytics", "Counting visits and which pieces are popular, so we know what to restock. Not in use today.", "Yes, off until you agree"],
            ["Marketing", "Measuring our adverts on Instagram and TikTok. Not in use today.", "Yes, off until you agree"],
          ],
        } },
        "Under the Data Protection and Privacy Act, 2019 we only collect what we need and only with your consent where the law asks for it. If we start using an analytics or marketing tool, it will load only for visitors who said yes, and we will update this page first. Clearing your browser's site data removes all of it.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        "Order and payment records are kept for five years, as the Tax Procedures Code Act, 2014 requires. Account details are kept until you ask us to delete your account. Newsletter emails are deleted when you unsubscribe. Contact messages are kept only as long as needed to resolve them.",
      ],
    },
    {
      id: "security",
      heading: "How we protect it",
      blocks: [
        "The site runs over an encrypted connection (HTTPS). Passwords are stored scrambled. Only our staff who need your information to serve you can see it, each with their own login.",
        "If your information is ever accessed without permission, we will report it to the Personal Data Protection Office straight away, as section 23 of the Act requires, and tell you if it affects you.",
      ],
    },
    {
      id: "photos",
      heading: "Photos and social media",
      blocks: [
        "We never post a photo or video of a customer, including from the showroom, without asking first. If you have agreed and change your mind, tell us and we will take it down.",
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
        "If you have an account, you can download a copy of your data or close your account yourself, from Settings in your account. Orders stay in our books for tax, without your name or contact details.",
        `To use any of these rights, ${contactLine(s)} We will reply within 30 days. If you are not satisfied, you can complain to the Personal Data Protection Office (PDPO) in Uganda.`,
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: ["Our site is not aimed at children under 18, and we do not knowingly collect their information without a parent's or guardian's consent, as section 8 of the Act requires. A parent or guardian should place orders for a child. If you believe we hold a child's information, tell us and we will delete it."],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: ["If we change this policy, we will update the date at the top of this page. Significant changes will also be shown on the site."],
    },
  ],
});
