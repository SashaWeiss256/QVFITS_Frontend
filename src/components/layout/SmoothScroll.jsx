/* Smooth Scroll */
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { setLenis } from "@/utils/smoothScroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth, weighted scrolling for the storefront (Lenis, driven by GSAP's own
 * ticker so ScrollTrigger and the page move on the same frame). A mouse wheel
 * or trackpad glides to a stop; touch keeps the device's own scroll. It steps
 * aside whenever a drawer, menu or dialog locks the page (they set
 * body overflow hidden), and is off for anyone who asks for less motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      wheelMultiplier: 0.9,
    });
    setLenis(lenis);

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // A drawer, menu or dialog locks the page by setting body overflow hidden; hold still while it does.
    const sync = () => (document.body.style.overflow === "hidden" ? lenis.stop() : lenis.start());
    const watch = new MutationObserver(sync);
    watch.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    sync();

    return () => {
      watch.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
