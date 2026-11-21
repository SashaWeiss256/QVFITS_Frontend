/* Photo Resizing (from Quivogue js/admin.js) */

/**
 * Resized in the browser before upload, to the same ladder the storefront's
 * photos use, as WebP (JPEG in Safari). Without this, a 6 MB phone photo would be served to every
 * shopper and undo the page-weight work. qvfits-api stores the results in
 * DigitalOcean Spaces.
 */
export const PHOTO_LADDER = [1200, 800, 400];

// Safari can't encode WebP from a canvas: it quietly hands back a PNG, which
// at 2000px is often over 5 MB. Anything but WebP is encoded again as JPEG.
const encode = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/** Shrunk to `maxWidth`, as WebP where the browser can make it and JPEG where it can't (Safari). */
export function resizePhoto(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      encode(canvas, "image/webp", 0.82)
        .then((webp) => (webp?.type === "image/webp" ? { blob: webp, ext: "webp" } : encode(canvas, "image/jpeg", 0.85).then((jpeg) => ({ blob: jpeg, ext: "jpg" }))))
        .then(({ blob, ext }) => (blob ? resolve({ blob, width, height, ext }) : reject(new Error("Could not read that image"))), reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image this browser can open"));
    };
    img.src = url;
  });
}

/** Every rung of the ladder for one photo. */
export function resizeLadder(file) {
  return Promise.all(PHOTO_LADDER.map((w) => resizePhoto(file, w).then((out) => ({ ...out, ladder: w }))));
}
