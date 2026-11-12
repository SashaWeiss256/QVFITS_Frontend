/* Cookie Consent */
import { useSyncExternalStore } from "react";

import { readStored, writeStored } from "@/utils/storage";

/**
 * What the shopper agreed the site may store, by purpose (gap F1). Essential
 * storage (bag, saved pieces, sign-in, currency) needs no consent and is
 * always on; analytics and marketing stay off until the shopper says yes.
 * The choice is kept with its version and date, so a later change to what
 * the site uses can ask again by raising VERSION.
 */
const KEY = "qvfits:consent";
export const CONSENT_VERSION = 1;

const listeners = new Set();
let open = false;
let current = load();

function load() {
  const saved = readStored(KEY, null);
  return saved?.version === CONSENT_VERSION ? saved : null;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Save a choice: { analytics, marketing }. */
export function saveConsent({ analytics = false, marketing = false }) {
  current = { version: CONSENT_VERSION, essential: true, analytics: Boolean(analytics), marketing: Boolean(marketing), at: new Date().toISOString() };
  writeStored(KEY, current);
  open = false;
  emit();
}

/** The footer's "Cookie settings" link: show the choices again. */
export function openCookieSettings() {
  open = true;
  emit();
}

export function closeCookieSettings() {
  open = false;
  emit();
}

const snapshot = () => current;
const openSnapshot = () => open;

/**
 * The saved choice (null until the shopper decides) and whether the
 * settings are open. Any analytics or pixel script must check
 * `allowed("analytics")` or `allowed("marketing")` before it loads.
 */
export function useConsent() {
  const consent = useSyncExternalStore(subscribe, snapshot, snapshot);
  const settingsOpen = useSyncExternalStore(subscribe, openSnapshot, openSnapshot);
  return { consent, settingsOpen, allowed: (purpose) => purpose === "essential" || Boolean(consent?.[purpose]) };
}
