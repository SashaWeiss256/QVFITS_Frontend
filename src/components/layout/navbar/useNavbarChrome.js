/* Navbar Chrome */
import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/**
 * The header's scroll states: `stuck` once the page scrolls under it,
 * and `hidden` while scrolling down (back the moment you scroll up).
 */
export function useNavbarChrome() {
  const { scrollY } = useScroll();
  const [state, setState] = useState({ y: 0, hidden: false });

  useMotionValueEvent(scrollY, "change", (y) => {
    setState((prev) => {
      const delta = y - prev.y;
      const hidden = y > 160 && delta > 4 ? true : delta < -4 || y < 160 ? false : prev.hidden;
      return hidden === prev.hidden && Math.abs(delta) < 1 ? prev : { y, hidden };
    });
  });

  return { stuck: state.y > 8, hidden: state.hidden };
}
