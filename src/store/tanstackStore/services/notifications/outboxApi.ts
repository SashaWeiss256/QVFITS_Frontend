/* Email Outbox Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import type { OutboxEmail } from "../types";

/**
 * Every email the shop sends, from the API: order updates, account and
 * newsletter emails, invites, campaigns and alerts, each with what happened
 * to it (queued, sent, failed, held until a mailbox is set up, or only a
 * phone to send it to). Sent through Zoho Mail by the API's email queue.
 */

// Outside production the API hands back the link from an account or newsletter email, so those flows can be tried without an inbox.
const demoLinks = new Map<string, string>();
export function rememberDemoLink(to: string, kind: OutboxEmail["kind"], link: string) {
  demoLinks.set(`${to}|${kind}`, link);
}

/** The newest link of a kind sent to an address in this browser: the dev build's "open the link" shortcut. */
export function latestEmail(to: string, kind: OutboxEmail["kind"]) {
  const link = demoLinks.get(`${to}|${kind}`);
  return link ? ({ to, kind, link } as Pick<OutboxEmail, "to" | "kind" | "link">) : null;
}

export function listOutbox({ signal }: RequestOptions = {}) {
  return http.get<OutboxEmail[]>(routes.adminSales.outbox, { realm: "admin", signal });
}

/** Send again an email that failed or was held (for example, before the mailbox was set up). */
export function retryEmail(id: Id) {
  return http.post<OutboxEmail>(`${routes.adminSales.outbox}/${id}/retry`, undefined, { realm: "admin" });
}
