/* Navbar Chrome */
import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/** The header's scroll state: `stuck` once the page scrolls under it. */
export function useNavbarChrome() {
  const { scrollY } = useScroll();
  const [stuck, setStuck] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setStuck(y > 8));
  return { stuck };
}
