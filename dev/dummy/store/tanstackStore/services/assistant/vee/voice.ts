/* Vee: Voice */
import type { VeeContext } from "./context";

/**
 * How Vee sounds, in one place. Every line has a plain version and a wittier
 * one. The dashboard's tone setting decides how often the witty one is used
 * (playful: mostly, balanced: now and then, straight: never), and she never
 * makes a joke twice in a row, or about money, sizing, delivery or a problem
 * (`session.serious`). Copy rule: no dashes.
 */
type Bank = { plain: string[]; wit: string[] };

const BANK: Record<string, Bank> = {
  askActivity: {
    plain: ["Happy to. What are you training in?", "Let's build it. What's the activity: gym, running, pilates, swim, or lounge?"],
    wit: ["Let's do it. What's the occasion: gym, running, pilates, swim, or a very committed sofa day?", "Say no more. What are we dressing: gym, running, pilates, court, swim, or lounge?"],
  },
  outfitIntro: {
    plain: ["Here is what I would put together:", "These work well together:"],
    wit: ["I've been waiting for someone to ask. Here is what I would put together:", "Three looks, no clashing, no regrets:"],
  },
  kitIntro: {
    plain: ["One of our ready made kits fits, and it saves you money:"],
    wit: ["Good news: the team already did the matching, and it comes with a discount:"],
  },
  customIntro: {
    plain: ["Or I can mix your own from what is in stock:"],
    wit: ["Or we go off script and mix your own from what is in stock:"],
  },
  none: {
    plain: ["I could not find a combination that works and is in stock. I would rather say so than send you something that clashes."],
    wit: ["I tried. Nothing in stock sits well together for that, and I will not send you out looking confused."],
  },
  added: {
    plain: ["Done. They are in your bag."],
    wit: ["Done. Your bag just got better dressed."],
  },
  thanks: {
    plain: ["Any time. Shout if you want another look."],
    wit: ["Any time. I will be here, judging nothing and matching everything."],
  },
};

const pickOne = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** One line from the bank, witty or plain by the tone and what was said last. */
export function say(ctx: VeeContext, key: keyof typeof BANK | string): string {
  const bank = BANK[key];
  if (!bank) return "";
  const tone = ctx.settings.assistant?.tone ?? "balanced";
  const chance = tone === "playful" ? 0.7 : tone === "balanced" ? 0.35 : 0;
  const funny = !ctx.session.serious && !ctx.session.lastWit && Math.random() < chance;
  ctx.session.lastWit = funny;
  return pickOne(funny ? bank.wit : bank.plain);
}
