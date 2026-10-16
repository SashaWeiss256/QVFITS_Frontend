/* Reveal Variants */

export const SPRING = { type: "spring", stiffness: 90, damping: 20, mass: 0.9 };

export const revealItem = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: SPRING },
};
