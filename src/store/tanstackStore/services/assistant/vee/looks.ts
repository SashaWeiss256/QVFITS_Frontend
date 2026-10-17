/* Vee: Looks, Gifts And Outfits */
import type { Product } from "../../types";
import { anyInStock } from "@/utils/stockLevel";
import { who, type VeeContext } from "./context";
import { findBudget, findCategory, findColors } from "./language";
import { cards, pick, text, ugx, type Block } from "./helpers";

// `w` is ", Amina" once she has said her name.
const OPENERS: Record<string, (w: string) => string> = {
  gym: (w) => `Lift day${w}: compression that stays put.`,
  run: (w) => `For running${w}, support first and nothing that chafes.`,
  yoga: (w) => `Yoga and pilates${w}: soft hold, full range.`,
  "golf-tennis": (w) => `Course and court${w}: inbuilt pant, so you can move.`,
  swim: (w) => `For the water${w}:`,
  lounge: (w) => `Rest day${w}. The soft stuff:`,
  everyday: (w) => `Everyday pieces${w}: train in them, live in them.`,
};

/** Pieces for an activity, narrowed by any category, colour or budget said. */
export function movementLook(occ: string, t: string, ctx: VeeContext): Block[] {
  const label = ctx.movements.find((m) => m.id === occ)?.name ?? occ;
  const budget = findBudget(t);
  const colors = findColors(t, ctx.swatches);
  const cat = findCategory(t);
  let items = ctx.products.filter((p) => p.termIds.includes(occ) && anyInStock(p));

  if (cat) {
    const inCat = items.filter((p) => p.category === cat);
    if (inCat.length) items = [...inCat, ...items.filter((p) => p.category !== cat)];
  }
  if (colors.length) {
    const byColor = items.filter((p) => colors.some((c) => p.colors.includes(c)));
    if (byColor.length) items = byColor;
  }
  if (budget) {
    const under = items.filter((p) => p.price <= budget);
    if (!under.length) {
      const cheapest = Math.min(...ctx.products.filter(anyInStock).map((p) => p.price));
      return [text(`Nothing for ${label.toLowerCase()} sits under ${ugx(budget)} right now${who(ctx)}. I won't stretch the truth. The most affordable piece in stock is ${ugx(cheapest)} if you want to stretch a little.`)];
    }
    items = under;
  }
  items = cat ? items.slice(0, 3) : [...items].sort((a, b) => b.price - a.price).slice(0, 3);

  return [
    text(OPENERS[occ]?.(who(ctx)) ?? `For ${label.toLowerCase()}${who(ctx)}:`),
    cards(items),
    text("Want me to pair it with a bra or a legging to finish the kit? Just say the word."),
  ];
}

const PAIRINGS: Record<string, string[]> = {
  Bottoms: ["Bras", "Sets", "Lounge"],
  Bras: ["Bottoms", "Skorts", "Lounge"],
  Sets: ["Bras", "Bottoms", "Lounge"],
  Skorts: ["Bras", "Bottoms", "Lounge"],
  Swim: ["Lounge", "Bras", "Bottoms"],
  Lounge: ["Bras", "Bottoms", "Sets"],
};

/** Pieces that complete a kit with this one, sharing an activity. */
export function outfitFor(subject: Product, ctx: VeeContext): Block[] {
  const partners: Product[] = [];
  for (const c of PAIRINGS[subject.category] ?? ["Bras", "Bottoms", "Lounge"]) {
    const found = ctx.products.find(
      (p) => p.category === c && p.id !== subject.id && anyInStock(p) && !partners.includes(p) && p.termIds.some((m) => subject.termIds.includes(m)),
    );
    if (found) partners.push(found);
  }
  return [
    text(`The ${subject.name} is a great starting point${who(ctx)}. I'd build it out like this:`),
    cards(partners.length ? partners : ctx.products.filter((p) => p.id !== subject.id && anyInStock(p)).slice(0, 3)),
    text("Keep one piece loud and the rest quiet and you can't go wrong."),
  ];
}

export function randomLook(ctx: VeeContext): Block[] {
  const look = pick(ctx.looks);
  return [
    text(`Let's build something${who(ctx)}! Here's one I love, "${look.title}": ${look.note}`),
    cards(look.items.map((id) => ctx.products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))),
    text("Tell me what you're training in and I'll tailor it properly."),
  ];
}

/** Lounge and swim lead: the forgiving sizes when you don't know hers. */
export function giftPicks(t: string, ctx: VeeContext): Block[] {
  const colors = findColors(t, ctx.swatches);
  const budget = findBudget(t);
  let items = ctx.products.filter(anyInStock);
  if (colors.length) items = items.filter((p) => colors.some((c) => p.colors.includes(c)));
  if (budget) items = items.filter((p) => p.price <= budget);
  if (!items.length) {
    return [text(`Nothing matches that exactly${who(ctx)}. I'd rather say so than send you something wrong. Try widening the colour or budget, or the team can pull something for you on WhatsApp.`)];
  }
  const rank = (p: Product) => (["Lounge", "Swim"].includes(p.category) ? 2 : 0) + (p.badge === "Bestseller" ? 1 : 0);
  items = items.sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  return [
    text(`Gifting is my favourite${who(ctx)}. ${colors.length ? `Since she loves ${colors[0].toLowerCase()}, ` : ""}these would land well:`),
    cards(items),
    text("If you don't know her size, lounge and swim are the forgiving ones. Mention it's a gift when the team confirms the order."),
  ];
}
