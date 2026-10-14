/* Newsletter Subscribers Service */
import { ApiError, mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { createCollection } from "../store/collectionStore";
import type { Subscriber } from "../types";
import { subscriberSeed } from "@/data/orders";

const subscribers = createCollection<Subscriber>("subscribers", subscriberSeed, { idPrefix: "sub" });

/**
 * Stored, so the admin can see and export the list. Honest seam: no email is
 * sent until qvfits-api connects Brevo or Mailchimp, and the form says so.
 */
export function subscribe(email: string) {
  return mockApi(() => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new ApiError("Enter a valid email address.", 422);
    const existing = subscribers.list().find((s) => s.email === clean);
    return existing ?? subscribers.create({ email: clean, createdAt: new Date().toISOString() });
  }, 300);
}

/* Admin (realm: admin) */

export function listSubscribers({ signal }: RequestOptions = {}) {
  return mockApi(() => subscribers.list(), 150, signal);
}
