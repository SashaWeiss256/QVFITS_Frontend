/* Smooth Scroll */
import { useEffect, useRef } from "react";
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
 * A thin brand line at the top shows how far down the page you are.
 */
export default function SmoothScroll() {
  const bar = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      wheelMultiplier: 0.9,
    });
    setLenis(lenis);

    const setProgress = gsap.quickSetter(bar.current, "scaleX");
    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      setProgress(e.limit > 0 ? e.scroll / e.limit : 0);
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

  return <div ref={bar} className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] origin-left scale-x-0 bg-[image:var(--brand-grad)]" aria-hidden="true" />;
}
