/* Newsletter Subscribers Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { queueEmail } from "../notifications/outboxApi";
import { createCollection, createDocument, type DocumentPatch } from "../store/collectionStore";
import type { NewsletterSettings, Subscriber, SubscriberSource } from "../types";
import newsletterSeed from "@/data/newsletter.json";
import subscriberSeed from "@/data/subscribers.json";

/**
 * The newsletter list, with double opt-in (after belioras): signing up
 * stores the address as pending with the words agreed to; the emailed link
 * confirms it; the welcome email (with its code) goes once per address,
 * ever. Unsubscribing keeps the record so the address is never mailed
 * again; erasing deletes it, for a privacy request.
 */
export const subscribers = createCollection<Subscriber>("subscribers", subscriberSeed as Subscriber[], { idPrefix: "sub" });
export const newsletterSettings = createDocument<NewsletterSettings>("newsletter", newsletterSeed as NewsletterSettings);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
const COOLDOWN = 60_000;

function sendConfirm(s: Subscriber) {
  queueEmail({
    to: s.email,
    kind: "newsletter-confirm",
    subject: "Confirm your QVFITS newsletter",
    body: `Tap to confirm you want news of drops and offers from QVFITS. ${s.consentText}`,
    link: `/newsletter/confirm?token=${s.token}`,
  });
}

/**
 * Sign up from the footer, the home page, checkout or the account. Already
 * subscribed: nothing changes. Pending: the link is sent again (at most once
 * a minute, gap A4). Unsubscribed before: they can opt back in.
 */
export function subscribe(email: string, { source = "footer", name, customerId }: { source?: SubscriberSource; name?: string; customerId?: Id } = {}) {
  return mockApi(() => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL.test(clean)) throw new ApiError("Enter a valid email address.", 422);
    const existing = subscribers.list().find((s) => s.email === clean);
    if (existing?.status === "subscribed") return { status: "subscribed" as const, email: clean };
    if (existing?.status === "pending" && Date.now() - Date.parse(existing.consentedAt) < COOLDOWN) return { status: "pending" as const, email: clean };
    const now = new Date().toISOString();
    const consentText = newsletterSettings.get().consentText;
    const row = existing
      ? subscribers.update(existing.id, { status: "pending", source: existing.status === "unsubscribed" ? "resubscribe" : existing.source, consentText, consentedAt: now, token: token(), unsubscribedAt: null })!
      : subscribers.create({ email: clean, name, customerId, status: "pending", source, consentText, consentedAt: now, confirmedAt: null, unsubscribedAt: null, token: token(), welcomeSentAt: null, createdAt: now });
    sendConfirm(row);
    return { status: "pending" as const, email: clean };
  }, 300);
}

/** The emailed link: pending becomes subscribed, and the welcome goes out once. */
export function confirmSubscription(t: string) {
  return mockApi(() => {
    const s = subscribers.list().find((x) => x.token === t);
    if (!s) throw new ApiError("That link isn't valid any more. Sign up again and we'll send a new one.", 404);
    if (s.status === "unsubscribed") throw new ApiError("This address unsubscribed. Sign up again to rejoin.", 410);
    if (s.status === "subscribed") return s;
    const now = new Date().toISOString();
    const settings = newsletterSettings.get();
    const welcome = settings.welcome.enabled && !s.welcomeSentAt;
    const row = subscribers.update(s.id, { status: "subscribed", confirmedAt: now, welcomeSentAt: welcome ? now : s.welcomeSentAt })!;
    if (welcome) {
      queueEmail({
        to: s.email,
        kind: "newsletter-welcome",
        subject: settings.welcome.subject,
        body: `${settings.welcome.heading}. ${settings.welcome.body}${settings.welcome.code ? ` Your code: ${settings.welcome.code}` : ""}`,
        link: `/newsletter/unsubscribe?token=${s.token}`,
      });
    }
    return row;
  }, 200);
}

/** Every email's unsubscribe link. The record stays, so the address isn't mailed again. */
export function unsubscribe(t: string) {
  return mockApi(() => {
    const s = subscribers.list().find((x) => x.token === t);
    if (!s) throw new ApiError("That link isn't valid any more.", 404);
    if (s.status !== "unsubscribed") subscribers.update(s.id, { status: "unsubscribed", unsubscribedAt: new Date().toISOString() });
    return { email: s.email };
  }, 200);
}

/** The account page's newsletter switch. */
export function subscriptionOf(email: string) {
  return mockApi(() => subscribers.list().find((s) => s.email === email.trim().toLowerCase())?.status ?? null, 100);
}
export function unsubscribeEmail(email: string) {
  return mockApi(() => {
    const s = subscribers.list().find((x) => x.email === email.trim().toLowerCase());
    if (s && s.status !== "unsubscribed") subscribers.update(s.id, { status: "unsubscribed", unsubscribedAt: new Date().toISOString() });
    return true;
  }, 200);
}

/** The consent words shown under every signup form, from the admin's newsletter settings. */
export const getNewsletterConsent = ({ signal }: RequestOptions = {}) => mockApi(() => newsletterSettings.get().consentText, 60, signal);

/** For the customer list: on the newsletter means confirmed. */
export const isSubscribed = (email: string) => subscribers.list().some((s) => s.email === email.trim().toLowerCase() && s.status === "subscribed");

/* Admin (realm: admin) */

export const listSubscribers = ({ signal }: RequestOptions = {}) =>
  mockApi(() => {
    assertCan("newsletter", "view");
    return [...subscribers.list()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, 150, signal);

export function unsubscribeSubscriber(id: Id) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    const s = subscribers.get(id);
    if (!s) throw new ApiError("That subscriber no longer exists.", 404);
    subscribers.update(id, { status: "unsubscribed", unsubscribedAt: new Date().toISOString() });
    logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Unsubscribed ${s.email}` });
  });
}

/** A privacy request: the address and its consent record are deleted. */
export function eraseSubscriber(id: Id) {
  return mockApi(() => {
    assertCan("newsletter", "delete");
    const s = subscribers.get(id);
    subscribers.remove(id);
    logActivity({ module: "newsletter", action: "delete", entityId: id, summary: `Erased ${s?.email ?? "a subscriber"} at their request` });
  });
}

export const getNewsletterSettings = ({ signal }: RequestOptions = {}) => mockApi(() => newsletterSettings.get(), 100, signal);
export function updateNewsletterSettings(patch: DocumentPatch<NewsletterSettings>) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    const next = { ...newsletterSettings.get(), ...patch } as NewsletterSettings;
    if (next.welcome.enabled && (!next.welcome.subject.trim() || !next.welcome.heading.trim() || !next.welcome.body.trim())) {
      throw new ApiError("The welcome email needs a subject, a heading and some words.", 422);
    }
    const doc = newsletterSettings.update(patch);
    logActivity({ module: "newsletter", action: "update", summary: "Updated the newsletter settings" });
    return doc;
  });
}
