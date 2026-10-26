/* Newsletter Subscribers Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { rememberDemoLink } from "../notifications/outboxApi";
import type { DocumentPatch } from "../store/collectionStore";
import type { NewsletterSettings, Subscriber, SubscriberSource } from "../types";

/**
 * The newsletter list on the API, with double opt-in: signing up stores the
 * address as pending with the words agreed to; the emailed link confirms it;
 * the welcome email (with its code) goes once per address, ever. Every
 * newsletter email carries its own signed unsubscribe link. Unsubscribing
 * keeps the record so the address is never mailed again; erasing deletes it.
 */

const N = routes.newsletter;
const A = routes.adminNewsletter;
const ADMIN = { realm: "admin" } as const;

type SignupResult = { status: "subscribed" | "pending"; email: string; devLink?: string };

// Outside production the API hands back the confirm link, so the flow can be tried without an inbox.
const keepDemoLink = (out: SignupResult) => {
  if (out.devLink) rememberDemoLink(out.email, "newsletter-confirm", out.devLink);
  return { status: out.status, email: out.email };
};

/**
 * Sign up from the footer, the home page or checkout. Already subscribed:
 * nothing changes. Pending: the link is sent again, at most once a minute.
 * Unsubscribed before: they can opt back in. The API limits how often one
 * address can sign up.
 */
export async function subscribe(email: string, { source = "footer", name }: { source?: SubscriberSource; name?: string; customerId?: Id } = {}) {
  return keepDemoLink(await http.post<SignupResult>(N.subscribe, { email, source, name }));
}

/** The emailed link: pending becomes subscribed, and the welcome goes out once. */
export function confirmSubscription(token: string) {
  return http.post<Subscriber>(N.confirm, { token });
}

/** Every newsletter email's unsubscribe link. */
export function unsubscribe(token: string) {
  return http.post<{ email: string }>(N.unsubscribe, { token });
}

/* The account's newsletter switch (realm: customer): always the account's own email. */

export function subscriptionOf(_email: string) {
  return http.get<Subscriber["status"] | null>(N.mine, { realm: "customer" });
}

export async function setMyNewsletter(on: boolean) {
  const out = await http.put<SignupResult | { status: "unsubscribed" }>(N.mine, { on }, { realm: "customer" });
  if ("email" in out) keepDemoLink(out);
  return out.status;
}

/** The consent words shown under every signup form, from the admin's newsletter settings. */
export const getNewsletterConsent = ({ signal }: RequestOptions = {}) => http.get<string>(N.consent, { signal });

/* Admin (realm: admin) */

export const listSubscribers = ({ signal }: RequestOptions = {}) => http.get<Subscriber[]>(A.subscribers, { ...ADMIN, signal });

// Staff can unsubscribe someone on request; the record stays, marked unsubscribed.
export async function unsubscribeSubscriber(id: Id) {
  const s = await http.post<Subscriber>(`${A.subscribers}/${id}/unsubscribe`, undefined, ADMIN);
  logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Unsubscribed ${s.email}` });
}

/** A privacy request: the address and its consent record are deleted. */
export async function eraseSubscriber(id: Id) {
  await http.del(`${A.subscribers}/${id}`, ADMIN);
  logActivity({ module: "newsletter", action: "delete", entityId: id, summary: "Erased a subscriber at their request" });
}

export const getNewsletterSettings = ({ signal }: RequestOptions = {}) => http.get<NewsletterSettings>(A.settings, { ...ADMIN, signal });

// A welcome email that is switched on needs a subject, a heading and some words; the API checks.
export async function updateNewsletterSettings(patch: DocumentPatch<NewsletterSettings>) {
  const doc = await http.patch<NewsletterSettings>(A.settings, patch, ADMIN);
  logActivity({ module: "newsletter", action: "update", summary: "Updated the newsletter settings" });
  return doc;
}
