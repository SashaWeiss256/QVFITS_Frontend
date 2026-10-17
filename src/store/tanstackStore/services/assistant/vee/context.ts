/* Vee: Context */
import type { Product, ShopSettings, SizeRow } from "../../types";
import type { Look } from "../../catalog/collectionsApi";
import type { Swatch } from "./colour";
import type { Mood } from "./colour";

/** Everything Vee reads: the live catalogue and shop settings, plus this chat's memory. */
export interface VeeContext {
  products: Product[];
  settings: ShopSettings;
  chart: SizeRow[];
  looks: Look[];
  movements: { id: string; name: string }[];
  swatches: string[];
  /** Every colour with its hex, for the colour engine. */
  palette: Swatch[];
  session: VeeSession;
}

export interface VeeSession {
  name: string | null;
  lastSubject: Product | null;
  awaitingName: boolean;
  /** Set when the last question found no answer. */
  missed?: boolean;
  /** What she has told Vee, kept on the device so she isn't asked twice. */
  size?: string | null;
  budget?: number | null;
  colors?: string[];
  /** She was just asked what she is dressing for, so her next message is the answer. */
  pendingOutfit?: boolean;
  /** The last outfit request, so "in black" or "cheaper" can refine it. */
  lastAsk?: { subjectId?: string | null; movement?: string | null; budget?: number | null; colors?: string[]; prefer?: Mood | null; total?: number } | null;
  /** The last reply made a joke, so the next one doesn't. */
  lastWit?: boolean;
  /** This reply is about money, sizing, delivery or a problem: no jokes. */
  serious?: boolean;
}

/** ", Amina" once she has said her name, "" before. */
export const who = (ctx: VeeContext) => (ctx.session.name ? `, ${ctx.session.name}` : "");
