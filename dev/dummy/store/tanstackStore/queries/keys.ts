/* Query Key Roots */
import type { Id, Realm } from "../services/api/types";

/**
 * Every key starts with its realm so a realm can be cleared, persisted or
 * refreshed on its own (docs/03-data-layer.md).
 *
 *   ["site", …]                public reads anyone can see; persisted
 *   ["customer", id, …]        one shopper's own data; never persisted
 *   ["admin", …]               admin data; never persisted, cleared on sign-out
 */
export const siteRoot = ["site"] as const;
export const adminRoot = ["admin"] as const;
export const customerRoot = (customerId: Id) => ["customer", customerId] as const;

/** The prefix to remove when a realm signs out or its token is rejected. */
export const realmRoot = (realm: Realm) => [realm] as const;
