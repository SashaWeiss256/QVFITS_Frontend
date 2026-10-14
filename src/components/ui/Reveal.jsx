/* Reveal (from Quivogue initReveal()) */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * Fades its content up as it scrolls into view. Never the reason content is
 * invisible: reduced motion, no IntersectionObserver, or 2.5 seconds passing
 * all show it at once.
 */
export default function Reveal({ as: Tag = "div", className, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || still || !("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "200px 0px 0px 0px" },
    );
    io.observe(el);
    const safety = setTimeout(() => setShown(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <Tag ref={ref} className={cn("reveal", shown && "is-in", className)} {...rest}>
      {children}
    </Tag>
  );
}
