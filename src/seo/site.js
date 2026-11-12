/* Where The Site Lives */

// The public address, used to build every canonical link and share image.
// Set VITE_SITE_URL when a staging site must point at itself instead.
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || "https://qvfits.com").replace(/\/+$/, "");
