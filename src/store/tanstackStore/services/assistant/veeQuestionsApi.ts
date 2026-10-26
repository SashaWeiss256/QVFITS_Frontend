/* Vee Questions Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { VeeQuestion } from "../types";

/**
 * What shoppers asked Vee, kept on the API so the shop can see what she
 * couldn't answer (Marketing, Vee). Only the question text and whether she
 * found an answer are stored: no name, no contact. The newest 200 are kept.
 */
export function logQuestion(text: string, answered: boolean) {
  const clean = text.trim().slice(0, 200);
  if (!clean) return;
  // Never in the shopper's way: a question that can't be logged is simply not kept.
  http.post(routes.site.veeQuestions, { text: clean, answered }).catch(() => {});
}

/* Admin (realm: admin) */

export const veeQuestionsCrud = httpCrud<VeeQuestion>(routes.adminSite.veeQuestions, { module: "vee", noun: "question", label: (q) => `"${q.text}"` });
export const listVeeQuestions = ({ signal }: RequestOptions = {}) => veeQuestionsCrud.list({ signal });
