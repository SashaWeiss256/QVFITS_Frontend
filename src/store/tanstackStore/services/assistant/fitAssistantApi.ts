/* Fit Assistant Service */
import { mockApi } from "../api/mock";
import { getFacets } from "../catalog/categoriesApi";
import { listLooks } from "../catalog/collectionsApi";
import { listProducts } from "../catalog/productsApi";
import { getSizeChart } from "../catalog/sizeChartApi";
import { getSettings } from "../content/settingsApi";
import type { VeeSession } from "./vee/context";
import type { Block } from "./vee/helpers";
import { buildOutfits } from "./vee/outfit";
import { reply } from "./vee/reply";
import { logQuestion } from "./veeQuestionsApi";

/**
 * "Vee", Quivogue's fit assistant: a real intent parser over the live
 * catalogue, stock and size chart (./vee). It is not a language model and
 * never says it is. An LLM can sit behind `POST assistant/ask` on the API
 * later without the widget changing: it returns the same blocks.
 */
export type { Block as AssistantBlock };

const NAME_KEY = "qvfits:vee-name";
const MEMORY_KEY = "qvfits:vee-memory";

// What she has told Vee (name, size, budget, colours) is kept on this device so she is not asked twice; nothing else is stored.
function readMemory(): Pick<VeeSession, "size" | "budget" | "colors"> {
  try {
    return JSON.parse(window.localStorage.getItem(MEMORY_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function readName() {
  try {
    return window.localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}
const session: VeeSession = { name: readName(), lastSubject: null, awaitingName: false, lastAsk: null, ...readMemory() };

function saveMemory() {
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify({ size: session.size ?? null, budget: session.budget ?? null, colors: session.colors ?? [] }));
  } catch {
    // Storage blocked: remembered for this visit only.
  }
}

/** "Forget me": clears her name, size, budget and colours from this device and from the chat. */
export function forgetMe() {
  Object.assign(session, { name: null, size: null, budget: null, colors: [], lastSubject: null, lastAsk: null });
  try {
    window.localStorage.removeItem(NAME_KEY);
    window.localStorage.removeItem(MEMORY_KEY);
  } catch {
    // Nothing stored to clear.
  }
}

// Everything Vee reads, gathered fresh so it always sees live stock.
async function context() {
  const [products, settings, chart, looks, facets] = await Promise.all([listProducts(), getSettings(), getSizeChart(), listLooks(), getFacets()]);
  return {
    products,
    settings,
    chart,
    looks,
    // Vee talks about what you train in: the terms of the Movement group.
    movements: facets.terms.filter((t) => t.groupId === "movement").map(({ id, name }) => ({ id, name })),
    swatches: facets.colors.map((c) => c.name),
    palette: facets.colors.map((c) => ({ id: c.id, name: c.name, hex: c.swatch })),
    session,
  };
}

export async function ask(question: string): Promise<Block[]> {
  const ctx = await context();
  const before = session.name;
  session.missed = false;
  const blocks = reply(question, ctx);
  // What was asked, and whether she found an answer, for Marketing, Vee.
  logQuestion(question, !session.missed);
  saveMemory();
  if (session.name && session.name !== before) {
    try {
      window.localStorage.setItem(NAME_KEY, session.name);
    } catch {
      // Storage blocked: she's remembered for this visit only.
    }
  }
  // No staged pause: the answer is ready as soon as the data is. The chat shows its typing dots only while a slow one loads.
  return mockApi(() => blocks, 0);
}

/** The greeting set in the dashboard, personal once she has said her name. */
export function greeting(text?: string) {
  return session.name ? `Welcome back, ${session.name}. What are we finding today?` : text || "Hey! Looking for your fit? Tell me what you train in.";
}

/**
 * Outfits built around one piece, for the product page and the bag (no chat
 * needed): the same engine Vee uses, in the size she has told Vee. Kits that
 * hold the piece come first, then custom mixes.
 */
export async function suggestOutfits(productId: string) {
  const ctx = await context();
  const subject = ctx.products.find((p) => p.id === productId);
  if (!subject || subject.type === "kit") return [];
  const { kits, custom } = buildOutfits(ctx, { subject });
  return [...kits, ...custom];
}
