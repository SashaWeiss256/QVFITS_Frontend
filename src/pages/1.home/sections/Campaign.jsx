/* Campaign */
import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Photo from "@/components/storefront/Photo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * One campaign photograph across the full width of the window, the words on
 * a deep-purple panel beside it. As the section scrolls past, the picture
 * drifts a little slower than the page (a gentle parallax), which never runs
 * for reduced motion. Switched on and written in src/data/home.json.
 */
export default function Campaign({ campaign: c }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-drift]",
        { yPercent: -8 },
        { yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: root },
  );

  if (!c?.live) return null;

  return (
    <section ref={root} className="grid bg-sand-100 text-ink lg:grid-cols-[1.5fr_1fr]">
      {/* Picture: full bleed, drifting */}
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:min-h-[78vh]">
        <div data-drift className="absolute inset-[-10%_0]">
          <Photo photo={c.photo} label={c.title} wide />
        </div>
      </div>

      {/* Words */}
      <div className="flex flex-col justify-center px-[clamp(20px,5vw,80px)] py-16 lg:py-24">
        <p className="kicker">{c.kicker}</p>
        <h2 className="mb-6 text-ink">{c.title}</h2>
        {c.text && <p className="mb-10 max-w-md text-[1.05rem] leading-relaxed text-ink-2">{c.text}</p>}
        <div>
          <Link className="btn btn--primary btn--lg" to={c.href}>{c.cta}</Link>
        </div>
      </div>
    </section>
  );
}
