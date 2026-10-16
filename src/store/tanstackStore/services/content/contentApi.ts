/* Home Content Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { localPhoto } from "../catalog/photos";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import type { Photo } from "../types";
import homeSeed from "@/data/home.json";

/**
 * Everything on the home page, top to bottom as the original Quivogue site
 * lays it out: hero slides, the press row, the two product rails, shop by
 * movement, the campaign, the feed and the newsletter. One document, so the
 * admin saves a section at a time without touching the rest.
 *
 * A picture is either a photo id in /photos (the brand's shoot) or an
 * uploaded Photo; `photo` on the view is always the resolved one.
 */
type Picture = string | Photo | null | undefined;

export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The round tag on the picture, e.g. "Sale". */
  sticker?: string;
  image?: Picture;
  live: boolean;
}

export interface Rail {
  kicker: string;
  title: string;
  cta: string;
  href: string;
  productIds: string[];
}

export interface Movement {
  id: string;
  label: string;
  /** The activity ids the tile filters by, comma separated. */
  occasion: string;
  image?: Picture;
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  rails: { newReleases: Rail; bestSellers: Rail };
  movements: { title: string; items: Movement[] };
  campaign: { live: boolean; kicker: string; title: string; text: string; cta: string; href: string; image?: Picture };
  press: { live: boolean; title: string; items: { name: string; href?: string }[] };
  feed: { live: boolean; kicker: string; title: string; items: { id: string; label: string; href: string; post?: string }[] };
  newsletter: { kicker: string; title: string; text: string; cta: string; placeholder: string };
}

const content = createDocument<HomeContent>("home", homeSeed as unknown as HomeContent);

const resolve = (picture: Picture, fallbackId: string): Photo | undefined =>
  picture && typeof picture === "object" ? picture : localPhoto(picture || fallbackId);

/** The document as the storefront reads it: live slides only, every picture resolved. */
export type HomeContentView = HomeContent & {
  heroSlides: (HeroSlide & { photo?: Photo })[];
  movements: HomeContent["movements"] & { items: (Movement & { photo?: Photo })[] };
  campaign: HomeContent["campaign"] & { photo?: Photo };
  /** The studio photo on the About page. */
  aboutPhoto?: Photo;
};

function view(doc: HomeContent, { all = false } = {}): HomeContentView {
  return {
    ...doc,
    heroSlides: doc.heroSlides.filter((s) => all || s.live !== false).map((s) => ({ ...s, photo: resolve(s.image, s.id) })),
    movements: { ...doc.movements, items: doc.movements.items.map((m) => ({ ...m, photo: resolve(m.image, `movement-${m.id}`) })) },
    campaign: { ...doc.campaign, photo: resolve(doc.campaign.image, "banner-campaign") },
    aboutPhoto: localPhoto("about"),
  };
}

export function getContent({ signal }: RequestOptions = {}) {
  return mockApi(() => view(content.get()), 100, signal);
}

/* Admin (realm: admin) */

/** Every slide, live or not, for the editor. */
export function getContentForEdit({ signal }: RequestOptions = {}) {
  return mockApi(() => view(content.get(), { all: true }), 100, signal);
}

export function updateContent(patch: DocumentPatch<HomeContent>) {
  return mockApi(() => {
    assertCan("home-content", "edit");
    const doc = content.update(patch);
    logActivity({ module: "home-content", action: "update", summary: `Updated the home page (${Object.keys(patch).join(", ")})` });
    return view(doc, { all: true });
  });
}
