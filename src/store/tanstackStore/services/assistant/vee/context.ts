/* Vee: Context */
import type { Product, ShopSettings, SizeRow } from "../../types";
import type { Look } from "../../catalog/collectionsApi";

/** Everything Vee reads: the live catalogue and shop settings, plus this chat's memory. */
export interface VeeContext {
  products: Product[];
  settings: ShopSettings;
  chart: SizeRow[];
  looks: Look[];
  movements: { id: string; name: string }[];
  swatches: string[];
  session: VeeSession;
}

export interface VeeSession {
  name: string | null;
  lastSubject: Product | null;
  awaitingName: boolean;
}

/** ", Amina" once she has said her name, "" before. */
export const who = (ctx: VeeContext) => (ctx.session.name ? `, ${ctx.session.name}` : "");
