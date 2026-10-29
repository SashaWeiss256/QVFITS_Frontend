/* Vee Questions Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { VeeQuestion } from "../types";

/**
 * What shoppers asked Vee, kept so the shop can see what she couldn't
 * answer (Marketing, Vee). Only the question text and whether she found
 * an answer are stored: no name, no contact. The newest 200 are kept.
 */
const questions = createCollection<VeeQuestion>("vee-questions", [], { idPrefix: "vq" });
const KEEP = 200;

export function logQuestion(text: string, answered: boolean) {
  const clean = text.trim().slice(0, 200);
  if (!clean) return;
  questions.create({ text: clean, answered, createdAt: new Date().toISOString() });
  const all = questions.list();
  if (all.length > KEEP) all.slice(0, all.length - KEEP).forEach((q) => questions.remove(q.id));
}

/* Admin (realm: admin) */

export const veeQuestionsCrud = adminCrud(questions, { module: "vee", noun: "question", label: (q) => `"${q.text}"` });
export const listVeeQuestions = ({ signal }: RequestOptions = {}) =>
  mockApi(() => [...questions.list()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 150, signal);
