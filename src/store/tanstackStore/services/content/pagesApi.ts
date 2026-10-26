/* Page Copy And Navigation Service */
import { http } from "../api/client";
import { mockApi } from "../api/mock";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { localPhoto } from "../catalog/photos";
import type { DocumentPatch } from "../store/collectionStore";
import { linkLookup, type LinkLookup } from "../catalog/attributesApi";
import type { Linked, Photo } from "../types";
import { shopMenuColumns, targetExists, topBarLinks, withHrefs, withoutHrefs } from "@/utils/shopTargets";
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
  feature: MenuFeatureView;
}

/** The picture tile at the end of the Shop menu: a photo, two lines and a link, all set in the dashboard. */
export interface MenuFeature extends Linked {
  live: boolean;
  kicker: string;
  title: string;
  cta: string;
  /** A photo id in /photos, or an uploaded photo. */
  image?: string | Photo | null;
}
export type MenuFeatureView = MenuFeature & { href: string; photo?: Photo };

export interface Navigation {
  header: NavLink[];
  help: NavLink[];
  legal: NavLink[];
  popularSearches: string[];
}

/**
 * The Shop menu's picture tile is dashboard data on the API (Catalog,
 * Categories, Menu): its photo can be uploaded, swapped or taken away, and it
 * can be switched off. A deleted photo falls back to the shoot's campaign banner.
 */

// The tile's picture: an uploaded photo, a /photos id, or the campaign banner.
const featurePhoto = (doc: MenuFeature) => (doc.image && typeof doc.image === "object" ? doc.image : localPhoto(doc.image || "banner-campaign"));

function featureView(doc: MenuFeature, lookup: LinkLookup): MenuFeatureView {
  const view = withHrefs(doc, lookup) as MenuFeature & { href?: string };
  const photo = featurePhoto(doc);
  // A link to something deleted leaves the tile off rather than pointing nowhere.
  const live = doc.live && (!doc.target || targetExists(doc.target, lookup));
  return { ...view, live, href: view.href ?? "/shop", photo };
}

type FixedNav = { header: NavLink[]; help: NavLink[]; legal: NavLink[] };
const fixed = navigationSeed as unknown as FixedNav;

/** The top bar after Shop: the catalogue's own links (see topBarLinks), then the fixed pages (About). */
export function headerLinks(lookup: LinkLookup): NavLink[] {
  return topBarLinks(lookup, fixed.header);
}

/** The words people are most likely to look for: the categories, then the first Movement items. */
function popularSearches(lookup: LinkLookup): string[] {
  const names = [...lookup.categories.map((c) => c.name), ...lookup.terms.filter((t) => t.groupId === "movement").map((t) => t.name)];
  return [...new Set(names)].slice(0, 8);
}

/**
 * The menus as the shop reads them: every link with its href, links to
 * anything switched off or deleted dropped, and the Shop menu built from the
 * groups.
 */
function navigationView(lookup: LinkLookup, feature: MenuFeature): Navigation & { shopMenu: ShopMenu } {
  const live = <T extends Linked>(links: T[]) => links.filter((l) => !l.target || targetExists(l.target, lookup));
  return {
    header: withHrefs(headerLinks(lookup), lookup) as NavLink[],
    help: withHrefs(live(fixed.help), lookup) as NavLink[],
    legal: withHrefs(live(fixed.legal), lookup) as NavLink[],
    popularSearches: popularSearches(lookup),
    shopMenu: { columns: shopMenuColumns(lookup), feature: featureView(feature, lookup) },
  };
}

export const getPages = ({ signal }: RequestOptions = {}) => mockApi(() => pagesSeed, 80, signal);
// The live catalogue comes from the API; the menu tile itself is still a mock.
export async function getNavigation({ signal }: RequestOptions = {}) {
  const [lookup, feature] = await Promise.all([linkLookup({ signal }), http.get<MenuFeature>(routes.site.menuFeature, { signal })]);
  return mockApi(() => navigationView(lookup, feature), 80, signal);
}

/* Admin (realm: admin) */

/** The tile as stored, with its photo resolved for the editor. */
export async function getMenuFeatureForEdit({ signal }: RequestOptions = {}) {
  const doc = await http.get<MenuFeature>(routes.adminSite.menuFeature, { realm: "admin", signal });
  return { ...doc, photo: featurePhoto(doc) } as MenuFeature & { photo?: Photo };
}

// The editor sends the resolved photo back; only the stored picture is kept, and links keep their target only.
export async function updateMenuFeature(patch: DocumentPatch<MenuFeature & { photo?: Photo }>) {
  const { photo: _photo, ...rest } = withoutHrefs(patch) as typeof patch;
  const doc = await http.patch<MenuFeature>(routes.adminSite.menuFeature, rest, { realm: "admin" });
  logActivity({ module: "categories", action: "update", summary: "Updated the Shop menu tile" });
  return { ...doc, photo: featurePhoto(doc) } as MenuFeature & { photo?: Photo };
}
