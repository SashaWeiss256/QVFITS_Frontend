/* Page Copy And Navigation Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { linkLookup, sortedCategories, sortedTerms } from "../catalog/attributesApi";
import type { Linked } from "../types";
import { shopMenuColumns, targetExists, topBarLinks, withHrefs } from "@/utils/shopTargets";
import navigationSeed from "@/data/navigation.json";
import pagesSeed from "@/data/pages.json";

/**
 * The words on every page that is not a product, and the fixed menus. Both
 * are part of the site's code (src/data/pages.json, navigation.json), not
 * dashboard data. Text may carry {tokens} (freeShipping, address, year…) that
 * the page fills from live settings, so a fee change never leaves stale copy.
 *
 * Menus that follow the catalogue are never typed: the Shop menu and the top
 * bar are built from the "Shop by" groups (Catalog, Categories), and the
 * popular searches from the categories and Movement items. Only the fixed
 * pages (About, Help, Legal) come from navigation.json.
 */
export type PageCopy = typeof pagesSeed;
export interface NavLink extends Linked {
  title: string;
}

/**
 * The Shop mega menu, as the shop reads it. Never stored: it is built from
 * the "Shop by" groups, one column per group shown in the menu, its live
 * items in order, then the campaign tile.
 */
export interface ShopMenu {
  columns: { id: string; title: string; links: { id: string; title: string; href: string }[] }[];
  feature: "campaign";
}

export interface Navigation {
  header: NavLink[];
  help: NavLink[];
  legal: NavLink[];
  popularSearches: string[];
}

type FixedNav = { header: NavLink[]; help: NavLink[]; legal: NavLink[] };
const fixed = navigationSeed as unknown as FixedNav;

/** The top bar after Shop: the catalogue's own links (see topBarLinks), then the fixed pages (About). */
export function headerLinks(lookup = linkLookup()): NavLink[] {
  return topBarLinks(lookup, fixed.header);
}

/** The words people are most likely to look for: the categories, then the first Movement items. */
function popularSearches(): string[] {
  const names = [...sortedCategories().filter((c) => c.active).map((c) => c.name), ...sortedTerms().filter((t) => t.active && t.groupId === "movement").map((t) => t.name)];
  return [...new Set(names)].slice(0, 8);
}

/**
 * The menus as the shop reads them: every link with its href, links to
 * anything switched off or deleted dropped, and the Shop menu built from the
 * groups.
 */
function navigationView(): Navigation & { shopMenu: ShopMenu } {
  const lookup = linkLookup();
  const live = <T extends Linked>(links: T[]) => links.filter((l) => !l.target || targetExists(l.target, lookup));
  return {
    header: withHrefs(headerLinks(lookup), lookup) as NavLink[],
    help: withHrefs(live(fixed.help), lookup) as NavLink[],
    legal: withHrefs(live(fixed.legal), lookup) as NavLink[],
    popularSearches: popularSearches(),
    shopMenu: { columns: shopMenuColumns(lookup), feature: "campaign" },
  };
}

export const getPages = ({ signal }: RequestOptions = {}) => mockApi(() => pagesSeed, 80, signal);
export const getNavigation = ({ signal }: RequestOptions = {}) => mockApi(() => navigationView(), 80, signal);
