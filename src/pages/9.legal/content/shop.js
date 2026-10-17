/* Shared Policy Details */
import { formatIn } from "@/utils/formatCurrency";

// The date every policy was last revised. Change it with the text.
export const UPDATED = "17 October 2026";

const UGX = { code: "UGX", perUGX: 1, decimals: 0, display: "code" };
export const ugx = (n) => formatIn(UGX, n);

/** How to reach the shop, in one sentence, from the live settings. */
export const contactLine = (s) =>
  `WhatsApp or call ${s.phone}, email ${s.email}, or visit us at ${s.address}.`;
