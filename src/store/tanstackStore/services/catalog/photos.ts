/* Local Photos */
import type { Photo } from "../types";
import photoDims from "@/data/photos.json";

/**
 * The brand's own photography in /public/photos. photos.json is generated:
 * id → [full width, full height, [widths that exist as -NNN.webp]], so a
 * srcset is accurate and every picture holds its space before it loads.
 */
type Dims = [number, number, number[]];
const DIMS = photoDims as unknown as Record<string, Dims>;

export function localPhoto(id: string): Photo | undefined {
  const dims = DIMS[id];
  if (!dims) return undefined;
  const [width, height, widths] = dims;
  return { id, width, height, widths };
}

/** The local photos for an id on disk: <id> and <id>-2 (hero, campaign, kits). */
export function photosFor(id: string): Photo[] {
  return [id, `${id}-2`].map(localPhoto).filter((p): p is Photo => Boolean(p));
}
