/* FAQ Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud, byPosition } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { FaqItem } from "../types";
import faqSeed from "@/data/faq.json";

/** Questions and answers on the contact page, grouped and in the admin's order. */
const faq = createCollection<FaqItem>("faq", faqSeed as FaqItem[], { idPrefix: "faq" });

export function listFaq({ signal }: RequestOptions = {}) {
  return mockApi(() => byPosition(faq.list()), 100, signal);
}

/* Admin (realm: admin) */

export const faqCrud = adminCrud(faq, {
  module: "faq",
  noun: "question",
  label: (f) => `"${f.q}"`,
  prepare: (data, existing, all) => (existing ? data : { group: "General", ...data, position: all.length }),
});
