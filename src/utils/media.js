/* Photo Sources (from Quivogue media()) */

// ImageKit's own domain; a custom domain for it would be added here.
const isImageKit = (url) => /^https:\/\/ik\.imagekit\.io\//.test(url);

/**
 * The srcset needs the true widths (a wrong `w` makes the browser pick the
 * wrong file) and the img needs real width and height so a card holds its
 * space before the photo arrives.
 *
 * - Local photos (/photos): WebP at each width on disk, JPEG twin as fallback.
 * - Uploaded photos (a data: URL, from before uploads went to ImageKit): one
 *   resized WebP, served as it is.
 * - Remote photos (`photo.url`): ImageKit for uploads, Unsplash for the
 *   placeholders. Both crop and resize on request and pick WebP or AVIF
 *   themselves, so no <source>.
 */
export function photoSources(photo, { wide = false } = {}) {
  // A card is half the screen on a phone and about 300px on a desktop; a
  // wide image is the content column, capped at 1200.
  const sizes = wide ? "(max-width: 1240px) 100vw, 1200px" : "(max-width: 700px) 50vw, (max-width: 1500px) 300px, 360px";

  // Uploaded before photos went to ImageKit and kept in this browser:
  // already resized (lib/media.js), so it is served as it is.
  if (photo.url?.startsWith("data:")) {
    return { remote: true, srcSet: undefined, sizes: undefined, src: photo.url, width: photo.width, height: photo.height };
  }

  if (photo.url) {
    const ratio = photo.height / photo.width;
    // Uploads live on ImageKit (`tr=`, smart crop, WebP or AVIF as the browser allows); older photos on Unsplash.
    const at = isImageKit(photo.url)
      ? (w) => `${photo.url}?tr=w-${w},h-${Math.round(w * ratio)},fo-auto,f-auto,q-70`
      : (w) => `${photo.url}?w=${w}&h=${Math.round(w * ratio)}&fit=crop&crop=faces,entropy&auto=format&q=70`;
    return {
      remote: true,
      srcSet: photo.widths.map((w) => `${at(w)} ${w}w`).join(", "),
      sizes,
      src: at(800),
      width: photo.width,
      height: photo.height,
    };
  }

  const base = `/photos/${photo.id}`;
  return {
    remote: false,
    srcSet: [...photo.widths.map((n) => `${base}-${n}.webp ${n}w`), `${base}.webp ${photo.width}w`].join(", "),
    sizes,
    src: `${base}.jpg`,
    width: photo.width,
    height: photo.height,
  };
}
