/* Fit Assistant Service */
import { mockApi } from "../api/mock";
import { getFacets } from "../catalog/categoriesApi";
import { listLooks } from "../catalog/collectionsApi";
import { listProducts } from "../catalog/productsApi";
import { getSizeChart } from "../catalog/sizeChartApi";
import { getSettings } from "../content/settingsApi";
import type { VeeSession } from "./vee/context";
import type { Block } from "./vee/helpers";
import { reply } from "./vee/reply";

/**
 * "Vee", Quivogue's fit assistant: a real intent parser over the live
 * catalogue, stock and size chart (./vee). It is not a language model and
 * never says it is. An LLM can sit behind `POST assistant/ask` on the API
 * later without the widget changing: it returns the same blocks.
 */
export type { Block as AssistantBlock };

const NAME_KEY = "qvfits:vee-name";

// This chat's memory: her name (kept on the device) and the piece in hand.
const session: VeeSession = { name: readName(), lastSubject: null, awaitingName: false };

function readName() {
  try {
    return window.localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export async function ask(question: string): Promise<Block[]> {
  const [products, settings, chart, looks, facets] = await Promise.all([listProducts(), getSettings(), getSizeChart(), listLooks(), getFacets()]);
  const before = session.name;
  const blocks = reply(question, {
    products,
    settings,
    chart,
    looks,
    // Vee talks about what you train in: the terms of the Movement group.
    movements: facets.terms.filter((t) => t.groupId === "movement").map(({ id, name }) => ({ id, name })),
    swatches: facets.colors.map((c) => c.name),
    session,
  });
  if (session.name && session.name !== before) {
    try {
      window.localStorage.setItem(NAME_KEY, session.name);
    } catch {
      // Storage blocked: she's remembered for this visit only.
    }
  }
  // A short, human pause before the reply.
  return mockApi(() => blocks, 420 + Math.random() * 380);
}

/** The greeting, personal once she has said her name. */
export function greeting() {
  return session.name
    ? `Welcome back, ${session.name}. What are we finding today?`
    : "Hey! Looking for your fit? I know every piece in the studio. Tell me what you train in.";
}
