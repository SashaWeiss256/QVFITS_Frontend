/* Vee: The Brain (from Quivogue js/assistant.js reply()) */
import { anyInStock, inStock, productSizes } from "@/utils/stockLevel";
import { findSize } from "@/utils/sizing";
import { who, type VeeContext } from "./context";
import { cards, link, sizeGapLine, stockLine, text, ugx, type Block } from "./helpers";
import { findCategory, findMeasurements, findOccasion, findProduct, has, words } from "./language";
import { giftPicks, occasionLook, outfitFor, randomLook } from "./looks";
import { search } from "./search";

const FIT_LINE: Record<string, string> = { small: "runs a little small", large: "runs large", relaxed: "is cut relaxed", true: "is true to size" };

/**
 * A real intent parser over the real catalogue. It never invents a piece,
 * never claims stock it doesn't have, and hands off to the team when it
 * doesn't know. It is not a language model, and never says it is.
 */
export function reply(raw: string, ctx: VeeContext): Block[] {
  const t = raw.toLowerCase().trim();
  const { session, settings: s, products } = ctx;
  const team = link("Message the team on WhatsApp", `https://wa.me/${s.whatsapp}`, true);

  /* Names */
  if (session.awaitingName) {
    session.awaitingName = false;
    const stripped = raw.trim().replace(/^(i'?m|my name is|call me|it'?s)\s+/i, "");
    const n = stripped.split(/[\s,.!]/)[0];
    const looksLikeName =
      n && n.length < 20 && /^[a-z'-]+$/i.test(n) && stripped.split(/\s+/).length <= 2 && !findCategory(t) && !findOccasion(t) && !findProduct(t, products) &&
      !/\?|^(what|which|do|does|can|how|where|when|why|show|find|need|looking)\b/i.test(stripped);
    if (looksLikeName) {
      session.name = n[0].toUpperCase() + n.slice(1).toLowerCase();
      return [text(`Good to meet you, ${session.name}. Right: what are you training in?`)];
    }
  }
  const nameM = raw.match(/(?:i'?m|my name is|call me|this is)\s+([A-Za-z'-]{2,18})\b/i);
  if (nameM && !findCategory(t) && !findOccasion(t) && !findMeasurements(t).bust) {
    session.name = nameM[1][0].toUpperCase() + nameM[1].slice(1).toLowerCase();
    return [text(`Hi ${session.name}, good to meet you. What are we finding: something to train in, to swim in, or to live in?`)];
  }

  /* People, greetings, thanks */
  if (has(t, ["human", "real person", "someone else", "talk to a person", "agent", "manager", "speak to"])) {
    return [text(`Of course${who(ctx)}. The team answers fastest on WhatsApp, or come and try things on at ${s.address}.`), team];
  }
  if (/^(hi|hey|hello|yo|hola|good (morning|afternoon|evening))\b/.test(t) && t.length < 30) {
    if (!session.name) {
      session.awaitingName = true;
      return [text("Hey! I'm Vee. I know every piece in the studio and how each one fits. What should I call you?")];
    }
    return [text(`Hey ${session.name}, what are we looking for today?`)];
  }
  if (has(t, ["thank", "thanks", "thx", "appreciate"])) return [text(`Any time${who(ctx)}. Shout if you want me to put a full kit together.`)];

  /* Delivery, exchanges, orders, payment */
  if (has(t, ["delivery", "deliver", "shipping", "ship", "how long", "arrive"])) {
    const fees = (s.zones ?? []).filter((z) => !z.collect).map((z) => `${z.name} ${ugx(z.fee)}`).join(", ");
    return [text(`Delivery is ${fees}. Anything over ${ugx(s.freeShippingOver)} ships free, or collect from the showroom for nothing.`, "The team confirms the timing when they confirm your order."), link("Delivery details", "/delivery")];
  }
  if (has(t, ["return", "exchange", "refund", "swap it", "doesn't fit", "does not fit"])) {
    return [text(`We exchange anything unworn with its tags on within ${s.exchangeDays} days. Swim only if the liner is intact: hygiene rules.`, "Want me to help you pick a better size instead? Tell me your bust, waist and hip and I'll do the maths."), link("Exchanges policy", "/returns")];
  }
  if (has(t, ["track", "my order", "where is my", "order number", "order status"])) {
    return [text("You can check any order with its reference and phone number."), link("Track an order", "/track-order")];
  }
  if (has(t, ["pay", "payment", "mobile money", "momo", "cash", "card"])) {
    return [text("MTN Mobile Money, Airtel Money or card. Until online payment switches on, the team confirms payment with you once your order is in.")];
  }

  /* Opacity and care */
  if (has(t, ["squat proof", "squat-proof", "squatproof", "see through", "see-through", "sheer", "opaque", "transparent"])) {
    const tested = products.filter((p) => `${p.details.join(" ")} ${p.blurb}`.toLowerCase().includes("opaque"));
    return [
      text(`These are the pieces tested opaque under stretch${who(ctx)}. They're knitted heavier through the seat, so they hold up in a deep squat.`, "Lighter colourways are always the ones worth asking about. Ask the team about a specific shade and they'll tell you straight."),
      ...(tested.length ? [cards(tested.slice(0, 3))] : []),
      team,
    ];
  }
  if (has(t, ["wash", "care for", "shrink", "fabric softener", "tumble dry", "how do i care"])) {
    return [text("Cold wash, inside out, no fabric softener: it clogs the fibres and kills the stretch. Hang to dry, never tumble.", "Rinse swim in fresh water after chlorine or salt.")];
  }

  /* Size from measurements */
  const meas = findMeasurements(t);
  if (meas.bust || meas.waist || meas.hip) {
    const subject = findProduct(t, products) ?? session.lastSubject;
    const rec = findSize(ctx.chart, meas, subject ?? undefined);
    const given = [meas.bust && `bust ${meas.bust}`, meas.waist && `waist ${meas.waist}`, meas.hip && `hip ${meas.hip}`].filter(Boolean).join(", ");
    return [
      text(`With ${given} cm, you're a ${rec.size}${subject ? ` in the ${subject.name}` : ""}${rec.exact ? "" : " (closest match)"}. ${rec.note}`.trim(), subject ? stockLine(subject) : ""),
      subject ? cards([subject]) : link("The full size chart", "/size-guide"),
    ];
  }

  /* Fit questions */
  if (has(t, ["size", "sizing", "fit", "measure", "runs small", "run small", "runs large", "true to size", "what size"])) {
    const askedCat = findCategory(t);
    let carry = session.lastSubject;
    if (askedCat) {
      const inCat = products.filter((p) => p.category === askedCat && anyInStock(p));
      const ws = words(t).filter((w) => w.length > 3);
      const named = inCat.find((p) => ws.some((w) => `${p.name} ${p.blurb}`.toLowerCase().includes(w)));
      if (named) carry = named;
      else if (!carry || carry.category !== askedCat) carry = inCat[0] ?? carry;
    }
    const subject = findProduct(t, products) ?? carry;
    if (subject) {
      session.lastSubject = subject;
      return [
        text(`The ${subject.name} ${FIT_LINE[subject.fit ?? "true"] ?? "is true to size"}. ${subject.fitNote ?? ""}`.trim(), `${stockLine(subject)}${sizeGapLine(subject, t)}`, "Tell me your bust, waist and hip in cm and I'll pick your size exactly."),
        cards([subject]),
      ];
    }
    return [text(`Happy to help you size${who(ctx)}! Give me your bust, waist and hip in cm, like "bust 88, waist 70, hip 96", and tell me which piece.`), link("The full size chart", "/size-guide")];
  }

  /* Stock and restocks */
  if (has(t, ["in stock", "restock", "back in", "available", "sold out", "do you have"])) {
    const subject = findProduct(t, products);
    if (subject) {
      session.lastSubject = subject;
      const fully = !anyInStock(subject);
      const askedRestock = has(t, ["restock", "back in", "when will", "coming back"]);
      const anyGone = productSizes(subject).some((sz) => !inStock(subject, sz));
      return [
        text(stockLine(subject), askedRestock && anyGone ? "I can't promise a restock date: some pieces are one-off drops. Ask the team and they'll tell you honestly." : "", fully ? "In the meantime, these are close in spirit:" : ""),
        cards(fully ? products.filter((p) => p.category === subject.category && p.id !== subject.id && anyInStock(p)).slice(0, 3) : [subject]),
      ];
    }
  }

  /* Gifts and outfits */
  if (has(t, ["gift", "present", "for my sister", "for my friend", "for her", "birthday for"])) return giftPicks(t, ctx);
  if (has(t, ["goes with", "go with", "pair", "style it", "style this", "outfit", "what should i wear", "build a look", "match", "kit"])) {
    const subject = findProduct(t, products) ?? session.lastSubject;
    if (subject) {
      session.lastSubject = subject;
      return outfitFor(subject, ctx);
    }
    const occ = findOccasion(t);
    return occ ? occasionLook(occ, t, ctx) : randomLook(ctx);
  }

  /* An activity */
  const occ = findOccasion(t);
  if (occ && (has(t, ["need", "looking", "want", "for a", "for my", "help", "something"]) || t.split(/\s+/).length <= 4)) return occasionLook(occ, t, ctx);

  /* A named piece */
  const named = findProduct(t, products);
  if (named) {
    session.lastSubject = named;
    return [text(`The ${named.name}: great taste${who(ctx)}. ${named.blurb}`, `${ugx(named.price)}. ${stockLine(named)}${sizeGapLine(named, t)}`), cards([named])];
  }

  /* "do you have it in M?" about the last piece */
  const bare = t.match(/\b(?:in|got|have|any)\s+(?:a\s+)?(xs|s|m|l|xl)\b/i);
  if (bare && session.lastSubject) {
    return [text(`${session.lastSubject.name}: ${stockLine(session.lastSubject)}${sizeGapLine(session.lastSubject, ` ${bare[1]} `)}`), cards([session.lastSubject])];
  }

  /* Anything else: search */
  const r = search(t, ctx);
  if (r.items.length) {
    session.lastSubject = r.items[0];
    const bits = [r.colors[0]?.toLowerCase(), r.cat?.toLowerCase(), r.budget ? `under ${ugx(r.budget)}` : ""].filter(Boolean);
    const more = r.total - r.items.length;
    return [
      text(`${bits.length ? `${bits.join(" ")}: got you${who(ctx)}.` : `Here's what I'd pull for you${who(ctx)}.`} These are my picks:`),
      cards(r.items),
      ...(more > 0 ? [text(`There are ${more} more like these.`), link("See the full rail", "/shop")] : []),
    ];
  }

  /* Honest fallback */
  return [text(`I'm not sure I got that one${who(ctx)}, and I'd rather ask than guess. Try me with a category ("seamless leggings"), an activity ("something for the gym"), a colour, or a budget.`, "If it's an order question, the team is on WhatsApp."), team];
}
