/* FAQ Service */
import type { FaqItem } from "../types";
import faqSeed from "@/data/faq.json";

/**
 * Questions and answers on the contact page, grouped, in the order of
 * src/data/faq.json. Part of the site's code, not dashboard data. Vee reads
 * them too.
 */
export async function listFaq() {
  return [...(faqSeed as FaqItem[])].sort((a, b) => a.position - b.position);
}
