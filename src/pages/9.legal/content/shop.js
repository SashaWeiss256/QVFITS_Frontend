/* Shared Policy Details */
import { formatIn } from "@/utils/formatCurrency";

// The date every policy was last revised. Change it with the text.
export const UPDATED = "28 October 2026";

const UGX = { code: "UGX", perUGX: 1, decimals: 0, display: "code" };
export const ugx = (n) => formatIn(UGX, n);

/** How to reach the shop, in one sentence, from the live settings. */
export const contactLine = (s) =>
  `WhatsApp or call ${s.phone}, email ${s.email}, or visit us at ${s.address}.`;

/**
 * The business's legal identity. The Electronic Transactions Act, 2011 (s.24)
 * asks an online seller to show its full name, legal status and, for a
 * company, its registration number. These come from Settings once the shop
 * adds them (legalName, legalStatus, registrationNo); until then the line
 * shows only what is known, never a made-up number.
 */
export const legalIdentity = (s) => {
  const name = s.legalName ?? `${s.brand} (Quivogue)`;
  const parts = [name];
  if (s.legalStatus) parts.push(s.legalStatus);
  if (s.registrationNo) parts.push(`registration number ${s.registrationNo}`);
  return parts.join(", ");
};

/** The one sentence every policy ends with: your rights under the law stay. */
export const STATUTORY =
  "Nothing in this policy takes away any right you have as a consumer under the laws of Uganda, including the Electronic Transactions Act, 2011 and the Sale of Goods and Supply of Services Act, 2018. Where this policy and the law differ, the law applies.";
