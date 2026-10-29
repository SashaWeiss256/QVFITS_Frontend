/* Reveal Variants */

export const SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 };

// A quiet fade with the slightest lift: the hero carries the page's one
// big entrance, so scroll reveals stay calm.
export const revealItem = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};
