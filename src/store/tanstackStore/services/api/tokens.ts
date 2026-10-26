/* Access Tokens, Per Realm */

/**
 * Two realms, never one slot: an admin session and a customer session can
 * exist in the same browser at once, and neither may stand in for the other.
 * Signing out of one leaves the other signed in.
 *
 * The short-lived access token is kept in sessionStorage, so a reload keeps
 * you signed in; the API's httpOnly refresh cookie renews it. A shopper who
 * ticks "Stay signed in" keeps theirs in localStorage instead, so closing the
 * tab doesn't sign them out (gap A3); staff sessions always end with the tab.
 */

import type { Realm } from "./types";

export const REALMS: readonly Realm[] = ["customer", "admin"];

type TokenListener = (realm: Realm, token: string | null) => void;

const KEY = (realm: Realm) => `qvfits:token:${realm}`;
const listeners = new Set<TokenListener>();

export function accessToken(realm: Realm) {
  try {
    return window.sessionStorage.getItem(KEY(assertRealm(realm))) ?? (realm === "customer" ? window.localStorage.getItem(KEY(realm)) : null);
  } catch {
    return null;
  }
}

/** Where a realm's session lives: the tab, or (a remembered shopper) the browser. */
export function sessionStore(realm: Realm, remember = false): Storage {
  return realm === "customer" && remember ? window.localStorage : window.sessionStorage;
}

export function setAccessToken(realm: Realm, token: string | null, { remember = false }: { remember?: boolean } = {}) {
  assertRealm(realm);
  try {
    window.sessionStorage.removeItem(KEY(realm));
    window.localStorage.removeItem(KEY(realm));
    if (token) sessionStore(realm, remember).setItem(KEY(realm), token);
  } catch {
    // Storage unavailable: the session lasts until the next reload.
  }
  listeners.forEach((fn) => fn(realm, token ?? null));
}

/** Whether this realm's session was kept past the tab ("Stay signed in"), so a renewed token stays there too. */
export function isRemembered(realm: Realm) {
  try {
    return window.localStorage.getItem(KEY(assertRealm(realm))) !== null;
  } catch {
    return false;
  }
}

export function clearAccessToken(realm: Realm) {
  setAccessToken(realm, null);
}

/** Lets an auth context drop its user when a token is cleared elsewhere. */
export function onTokenChange(fn: TokenListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function assertRealm(realm: Realm) {
  if (!REALMS.includes(realm)) throw new Error(`Unknown auth realm: ${realm}`);
  return realm;
}
