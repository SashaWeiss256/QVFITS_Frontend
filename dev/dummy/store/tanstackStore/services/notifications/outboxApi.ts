/* Email Outbox Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { assertCan } from "../auth/adminSession";
import { createCollection } from "../store/collectionStore";
import type { OutboxEmail } from "../types";

/**
 * Every email the shop would send: newsletter confirmations and welcomes,
 * campaigns, order updates, password resets. Honest seam: until the API
 * connects an email service (Brevo or Mailchimp), they are kept here and
 * shown to staff (Newsletter, Outbox; and on each order). With the API the
 * same calls hand the email to the service instead.
 */
const outbox = createCollection<OutboxEmail>("outbox", [], { idPrefix: "mail" });
const KEEP = 400;

export function queueEmail(email: Omit<OutboxEmail, "id" | "createdAt">) {
  const row = outbox.create({ ...email, createdAt: new Date().toISOString() });
  const all = outbox.list();
  if (all.length > KEEP) outbox.replace(all.slice(0, KEEP));
  return row;
}

/** The newest email of a kind to an address: the dev build's "open the link" shortcut. */
export function latestEmail(to: string, kind: OutboxEmail["kind"]) {
  return [...outbox.list()].filter((m) => m.to === to && m.kind === kind).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

/** Emails tied to one order, oldest first, for the order drawer. */
export const emailsForOrder = (ref: string) => outbox.list().filter((m) => m.ref === ref).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export function listOutbox({ signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("newsletter", "view");
    return [...outbox.list()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, 120, signal);
}
