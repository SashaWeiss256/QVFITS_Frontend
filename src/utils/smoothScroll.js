/* Smooth Scroll Handle */

// The one Lenis instance, kept here so pages can scroll through it (a new page
// jumping to the top, a #anchor gliding into place) instead of fighting it.
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

/** To the top, at once (a new page). */
export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, left: 0 });
}

/** To the top, gliding (after a checkout step). */
export function glideTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** To an element, gliding, clear of the sticky header. */
export function glideTo(el) {
  if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
