/* Home Content Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { linkLookup, type LinkLookup } from "../catalog/attributesApi";
import { termView } from "../catalog/categoriesApi";
import { localPhoto } from "../catalog/photos";
import type { DocumentPatch } from "../store/patches";
import { targetLabel, withHrefs, withoutHrefs } from "@/utils/shopTargets";
import type { Linked, Photo } from "../types";
import homeSeed from "@/data/home.json";

/**
 * Everything on the home page, top to bottom as the original Quivogue site
 * lays it out: hero slides, the two product rails, shop by movement, the
 * campaign, the feed and the newsletter. The rails fill themselves from
 * products, and every link is a target that resolves to a live address (a
 * link to something deleted drops out).
 *
 * The document lives on the API (`site/home` to read, `admin/content/home` to
 * edit, in the admin's Home page): the hero, Shop by movement and Seen on you
 * are managed there. Until the API serves it, the copy in the site's code
 * (src/data/home.json) stands in, so the home page never depends on it.
 *
 * A picture is either a photo id in /photos (the brand's shoot) or an
 * uploaded Photo; `photo` on the view is always the resolved one.
 */
type Picture = string | Photo | null | undefined;

export interface HeroSlide extends Linked {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  /** A few words written in script above the headline, as in a signature, e.g. "Quivogue". */
  script?: string;
  /** The round tag on the picture, e.g. "Sale". */
  sticker?: string;
  image?: Picture;
  /** The picture is three portraits side by side (a triptych); the hero shows each as its own panel. */
  triptych?: boolean;
  /** For a single landscape picture: where the model stands, as a percentage from the left, so a phone crop keeps her in view. */
  focus?: number;
  live: boolean;
}

export interface Rail extends Linked {
  kicker: string;
  title: string;
  cta: string;
}

/** A Shop by movement tile. Label and picture default from the first term it opens. */
export interface MovementTile extends Linked {
  id: string;
  label?: string;
  image?: Picture;
}

/**
 * A Seen on you reel. Its still and clip default to the shoot's own files
 * (/photos/<id>.webp and .mp4) until one is uploaded; an uploaded still with
 * no clip shows as a still. `video: null` means no clip at all.
 */
export interface FeedItem extends Linked {
  id: string;
  label: string;
  post?: string;
  image?: Picture;
  video?: string | null;
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  rails: { newReleases: Rail; bestSellers: Rail };
  movements: { title: string; items: MovementTile[] };
  campaign: Linked & { live: boolean; kicker: string; title: string; text: string; cta: string; image?: Picture };
  feed: { live: boolean; kicker: string; title: string; items: FeedItem[] };
  newsletter: { kicker: string; title: string; text: string; cta: string; placeholder: string; perks: { icon: "sparkles" | "bell" | "gift"; title: string; text: string }[] };
}

const seed = homeSeed as unknown as HomeContent;

const resolve = (picture: Picture, fallbackId: string): Photo | undefined =>
  picture && typeof picture === "object" ? picture : localPhoto(picture || fallbackId);

/** A reel's clip: the uploaded one, none (null), or the shoot's own file while its still is the shoot's too. */
const reelVideo = (it: FeedItem) => (it.video !== undefined ? it.video || undefined : !it.image && localPhoto(it.id) ? `/photos/${it.id}.mp4` : undefined);

/** The document as the storefront reads it: live slides only, every picture resolved. */
export type HomeContentView = HomeContent & {
  heroSlides: (HeroSlide & { photo?: Photo })[];
  movements: HomeContent["movements"] & { items: (MovementTile & { label: string; href: string; photo?: Photo })[] };
  feed: HomeContent["feed"] & { items: (FeedItem & { href: string; photo?: Photo; clip?: string })[] };
  campaign: HomeContent["campaign"] & { photo?: Photo };
  /** The studio photo on the About page. */
  aboutPhoto?: Photo;
};

// Every link gets its href from the live slugs. A tile with no label or picture
// of its own borrows the first term it opens.
function view(stored: HomeContent, lookup: LinkLookup): HomeContentView {
  const doc = withHrefs(stored, lookup) as HomeContent & { movements: { items: (MovementTile & { href: string })[] } };
  const termOf = (t: MovementTile) => lookup.terms.find((x) => x.id === t.target?.terms?.[0]);
  return {
    ...doc,
    heroSlides: doc.heroSlides.filter((s) => s.live !== false).map((s) => ({ ...s, photo: resolve(s.image, s.id) })),
    movements: {
      ...doc.movements,
      items: doc.movements.items.map((t) => {
        const own = termOf(t);
        return {
          ...t,
          href: t.href ?? "/shop",
          label: t.label || targetLabel(t.target, lookup),
          photo: resolve(t.image, `movement-${t.id}`) ?? (own ? termView(own).photo : undefined),
        };
      }),
    },
    feed: { ...doc.feed, items: (doc.feed.items as (FeedItem & { href: string })[]).map((it) => ({ ...it, photo: resolve(it.image, it.id), clip: reelVideo(it) })) },
    campaign: { ...doc.campaign, photo: resolve(doc.campaign.image, "banner-campaign") },
    aboutPhoto: localPhoto("about"),
  };
}

/**
 * The stored document, laid over the copy in the code so a part the API does
 * not hold yet (the rails, the newsletter) keeps its words. If the API does
 * not serve the home page yet, or fails, the code's copy is used whole: the
 * home page must never go blank because of it.
 */
async function readHome(path: string, opts: RequestOptions & { realm?: "admin" }) {
  try {
    const doc = await http.get<Partial<HomeContent>>(path, opts);
    return { doc: { ...seed, ...doc } as HomeContent, onServer: true };
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") throw err;
    return { doc: seed, onServer: false };
  }
}

export async function getContent({ signal }: RequestOptions = {}) {
  const [lookup, { doc }] = await Promise.all([linkLookup({ signal }), readHome(routes.site.home, { signal })]);
  return view(doc, lookup);
}

/* Admin (realm: admin) */

/** What the admin's Home page edits: the hero, Shop by movement and Seen on you. */
export type HomeEditable = Pick<HomeContent, "heroSlides" | "movements" | "feed">;
/** The same, with each picture (and reel clip) resolved so the editor can show it. Never saved. */
export type HomeForEdit = HomeEditable & { onServer: boolean };

const forEdit = (doc: HomeContent, onServer: boolean): HomeForEdit => ({
  onServer,
  heroSlides: doc.heroSlides.map((s) => ({ ...s, photo: resolve(s.image, s.id) })),
  movements: { ...doc.movements, items: doc.movements.items.map((t) => ({ ...t, photo: resolve(t.image, `movement-${t.id}`) })) },
  feed: { ...doc.feed, items: doc.feed.items.map((it) => ({ ...it, photo: resolve(it.image, it.id), clip: reelVideo(it) })) },
});

// Only what is stored goes back: the resolved photo and clip, and every href, are worked out again on each read.
function strip(patch: DocumentPatch<HomeForEdit>) {
  const { onServer: _onServer, ...rest } = patch as DocumentPatch<HomeForEdit>;
  const clean = <T extends object>(items?: T[]) => items?.map((it) => { const { photo: _p, clip: _c, ...kept } = it as T & { photo?: unknown; clip?: unknown }; return kept; });
  const out: DocumentPatch<HomeEditable> = {};
  if (rest.heroSlides) out.heroSlides = clean(rest.heroSlides as HeroSlide[]);
  if (rest.movements) out.movements = { ...(rest.movements as HomeContent["movements"]), items: clean((rest.movements as HomeContent["movements"]).items) ?? [] };
  if (rest.feed) out.feed = { ...(rest.feed as HomeContent["feed"]), items: clean((rest.feed as HomeContent["feed"]).items) ?? [] };
  return withoutHrefs(out) as DocumentPatch<HomeEditable>;
}

/** The home page as stored, every picture resolved for the editor. `onServer: false` until the API serves it. */
export async function getHomeForEdit({ signal }: RequestOptions = {}) {
  const { doc, onServer } = await readHome(routes.adminSite.home, { realm: "admin", signal });
  return forEdit(doc, onServer);
}

const PARTS: Record<keyof HomeEditable, string> = { heroSlides: "hero", movements: "Shop by movement", feed: "Seen on you" };

export async function updateHome(patch: DocumentPatch<HomeForEdit>) {
  const body = strip(patch);
  const doc = await http.patch<HomeContent>(routes.adminSite.home, body, { realm: "admin" });
  const parts = (Object.keys(body) as (keyof HomeEditable)[]).map((k) => PARTS[k]).filter(Boolean);
  logActivity({ module: "offers", action: "update", summary: `Updated the home page (${parts.join(", ") || "content"})` });
  return forEdit({ ...seed, ...doc }, true);
}
