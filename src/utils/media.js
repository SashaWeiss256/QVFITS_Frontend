/* Photo Sources (from Quivogue media()) */

/**
 * The srcset needs the true widths (a wrong `w` makes the browser pick the
 * wrong file) and the img needs real width and height so a card holds its
 * space before the photo arrives.
 *
 * - Local photos (/photos): WebP at each width on disk, JPEG twin as fallback.
 * - Remote photos (`photo.url`): an image CDN that crops and resizes on
 *   request and picks WebP or AVIF itself (`auto=format`), so no <source>.
 */
export function photoSources(photo, { wide = false } = {}) {
  // A card is half the screen on a phone and about 300px on a desktop; a
  // wide image is the content column, capped at 1200.
  const sizes = wide ? "(max-width: 1240px) 100vw, 1200px" : "(max-width: 700px) 50vw, (max-width: 1500px) 300px, 360px";

  if (photo.url) {
    const ratio = photo.height / photo.width;
    const at = (w) => `${photo.url}?w=${w}&h=${Math.round(w * ratio)}&fit=crop&crop=faces,entropy&auto=format&q=70`;
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
