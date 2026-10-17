/* FAQ Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import type { FaqItem } from "../types";
import faqSeed from "@/data/faq.json";

/**
 * Questions and answers on the contact page, grouped, in the order of
 * src/data/faq.json. Part of the site's code, not dashboard data. Vee reads
 * them too.
 */
export function listFaq({ signal }: RequestOptions = {}) {
  return mockApi(() => [...(faqSeed as FaqItem[])].sort((a, b) => a.position - b.position), 100, signal);
}
