/* Page Copy And Navigation Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import navigationSeed from "@/data/navigation.json";
import pagesSeed from "@/data/pages.json";

/**
 * The words on every page that is not a product: headings, ledes, buttons,
 * lists such as the About values or the contact topics, and the header and
 * footer menus. Text may carry {tokens} (freeShipping, address, year…) that
 * the page fills from live settings, so a fee change never leaves stale copy.
 */
export type PageCopy = typeof pagesSeed;
export interface NavLink {
  title: string;
  path: string;
}
export interface Navigation {
  header: NavLink[];
  shopEdits: NavLink[];
  help: NavLink[];
  legal: NavLink[];
  popularSearches: string[];
}

const pages = createDocument<PageCopy>("pages", pagesSeed);
const navigation = createDocument<Navigation>("navigation", navigationSeed as Navigation);

export const getPages = ({ signal }: RequestOptions = {}) => mockApi(() => pages.get(), 80, signal);
export const getNavigation = ({ signal }: RequestOptions = {}) => mockApi(() => navigation.get(), 80, signal);

/* Admin (realm: admin) */

export function updatePages(patch: DocumentPatch<PageCopy>) {
  return mockApi(() => {
    assertCan("pages", "edit");
    const doc = pages.update(patch);
    logActivity({ module: "pages", action: "update", summary: `Updated page copy (${Object.keys(patch).join(", ")})` });
    return doc;
  });
}

export function updateNavigation(patch: DocumentPatch<Navigation>) {
  return mockApi(() => {
    assertCan("pages", "edit");
    const doc = navigation.update(patch);
    logActivity({ module: "pages", action: "update", summary: "Updated the menus" });
    return doc;
  });
}
