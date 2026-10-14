/* Access Tokens, Per Realm */

/**
 * Two realms, never one slot: an admin session and a customer session can
 * exist in the same browser at once, and neither may stand in for the other.
 * Signing out of one leaves the other signed in.
 *
 * Held in sessionStorage while the API runs on mocks, so a reload keeps you
 * signed in during development. When the backend lands, tokens move to memory
 * with an httpOnly refresh cookie, as in belioras.
 */

import type { Realm } from "./types";

export const REALMS: readonly Realm[] = ["customer", "admin"];

type TokenListener = (realm: Realm, token: string | null) => void;

const KEY = (realm: Realm) => `qvfits:token:${realm}`;
const listeners = new Set<TokenListener>();

export function accessToken(realm: Realm) {
  try {
    return window.sessionStorage.getItem(KEY(assertRealm(realm)));
  } catch {
    return null;
  }
}

export function setAccessToken(realm: Realm, token: string | null) {
  assertRealm(realm);
  try {
    if (token) window.sessionStorage.setItem(KEY(realm), token);
    else window.sessionStorage.removeItem(KEY(realm));
  } catch {
    // Storage unavailable: the session lasts until the next reload.
  }
  listeners.forEach((fn) => fn(realm, token ?? null));
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
