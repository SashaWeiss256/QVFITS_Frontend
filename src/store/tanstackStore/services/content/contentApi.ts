/* Home Content Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { linkLookup, type LinkLookup } from "../catalog/attributesApi";
import { termView } from "../catalog/categoriesApi";
import { localPhoto } from "../catalog/photos";
import { targetLabel, withHrefs } from "@/utils/shopTargets";
import type { Linked, Photo } from "../types";
import homeSeed from "@/data/home.json";

/**
 * Everything on the home page, top to bottom as the original Quivogue site
 * lays it out: hero slides, the two product rails, shop by movement, the
 * campaign, the feed and the newsletter. It is part of the site's code
 * (src/data/home.json), not dashboard data: the rails fill themselves from
 * products, and every link is a target that resolves to a live address (a
 * link to something deleted drops out). Honest seam: nothing here moves to
 * the backend.
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
  /** The round tag on the picture, e.g. "Sale". */
  sticker?: string;
  image?: Picture;
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

export interface HomeContent {
  heroSlides: HeroSlide[];
  rails: { newReleases: Rail; bestSellers: Rail };
  movements: { title: string; items: MovementTile[] };
  campaign: Linked & { live: boolean; kicker: string; title: string; text: string; cta: string; image?: Picture };
  feed: { live: boolean; kicker: string; title: string; items: (Linked & { id: string; label: string; post?: string })[] };
  newsletter: { kicker: string; title: string; text: string; cta: string; placeholder: string; perks: { icon: "sparkles" | "bell" | "gift"; title: string; text: string }[] };
}

const content = homeSeed as unknown as HomeContent;

const resolve = (picture: Picture, fallbackId: string): Photo | undefined =>
  picture && typeof picture === "object" ? picture : localPhoto(picture || fallbackId);

/** The document as the storefront reads it: live slides only, every picture resolved. */
export type HomeContentView = HomeContent & {
  heroSlides: (HeroSlide & { photo?: Photo })[];
  movements: HomeContent["movements"] & { items: (MovementTile & { label: string; href: string; photo?: Photo })[] };
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
    campaign: { ...doc.campaign, photo: resolve(doc.campaign.image, "banner-campaign") },
    aboutPhoto: localPhoto("about"),
  };
}

// The live catalogue comes from the API; the home page document itself is still a mock.
export async function getContent({ signal }: RequestOptions = {}) {
  const lookup = await linkLookup({ signal });
  return mockApi(() => view(content, lookup), 100, signal);
}
