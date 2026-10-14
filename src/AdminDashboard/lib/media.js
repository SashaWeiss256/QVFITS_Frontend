/* Photo Resizing (from Quivogue js/admin.js) */

/**
 * Resized in the browser before upload, to the same ladder the storefront's
 * photos use. Without this, a 6 MB phone photo would be served to every
 * shopper and undo the page-weight work. qvfits-api stores the results in
 * DigitalOcean Spaces.
 */
export const PHOTO_LADDER = [1200, 800, 400];

export function resizeToWebp(file, maxWidth) {
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
      canvas.toBlob((blob) => (blob ? resolve({ blob, width, height }) : reject(new Error("Could not read that image"))), "image/webp", 0.82);
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
  return Promise.all(PHOTO_LADDER.map((w) => resizeToWebp(file, w).then((out) => ({ ...out, ladder: w }))));
}
