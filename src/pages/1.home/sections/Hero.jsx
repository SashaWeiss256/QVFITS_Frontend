/* Hero */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import { photoSources } from "@/utils/media";
import { cn } from "@/utils/cn";

gsap.registerPlugin(useGSAP, SplitText);

// How long each slide holds, in seconds.
const HOLD = 5;
const prefersStill = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
// The hero fills the first screen.
const FULL = "min-h-svh";

/**
 * The hero: the campaign photograph fills the whole first screen. A soft
 * shade from the bottom keeps the words readable, and the header turns white
 * over it. The words are kept simple: one headline, one line under it and one
 * button, low on the left. A new campaign fades up while its picture settles
 * from a slight zoom and its headline lifts into place. Small rings at the
 * bottom right, one per slide, fill as the time to the next change runs out;
 * each picks its slide. Keeps playing under the mouse, holds only while the
 * tab is hidden, steps with the arrow keys, and stays still for reduced motion.
 */
export default function Hero({ slides }) {
  return (
    <section data-hero className={cn("relative -mt-[72px] overflow-hidden bg-ink text-cream lg:-mt-[84px]", FULL)}>
      {/* The slides' own titles rotate, so the page carries one h1 that does not. */}
      <h1 className="sr-only">Quivogue (QVFITS): premium seamless activewear, swim and lounge wear, Kampala</h1>
      {slides?.length ? <Slideshow slides={slides} /> : <div className={FULL} />}
    </section>
  );
}

function Slideshow({ slides }) {
  const count = slides.length;
  const [at, setAt] = useState(0);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));
  const [hidden, setHidden] = useState(false);
  const [still] = useState(prefersStill);
  const root = useRef(null);
  const first = useRef(true);
  const timer = useRef(null);
  const entrance = useRef({ tl: null, split: null });

  const go = useCallback(
    (n) => {
      const next = (n + count) % count;
      setAt(next);
      setMounted((m) => new Set([...m, next, (next + 1) % count]));
    },
    [count],
  );

  // The entrance: the picture fades up and settles, the words lift into place.
  useGSAP(
    () => {
      const visuals = gsap.utils.toArray("[data-visual]", root.current);
      const visual = visuals[at];
      const copy = root.current.querySelector(`[data-copy="${at}"]`);
      if (!visual || !copy) return undefined;
      const panel = visual.querySelector("[data-panel]");
      const zoom = visual.querySelector("[data-zoom]");
      const title = copy.querySelector("[data-title]");
      const flow = copy.querySelectorAll("[data-flow]");
      const others = visuals.filter((v) => v !== visual);

      gsap.set(visual, { autoAlpha: 1, zIndex: 2 });
      gsap.set(others, { zIndex: 1 });

      if (still) {
        gsap.set(others, { autoAlpha: 0 });
        gsap.set(flow, { opacity: 1, y: 0 });
        return undefined;
      }

      // useGSAP leaves earlier animations running when the slide changes, so stop the last entrance and
      // un-split its words before this one starts (a title split twice would nest its words).
      entrance.current.tl?.kill();
      entrance.current.split?.revert();
      const split = SplitText.create(title, { type: "words,lines", mask: "lines" });
      const tl = gsap.timeline();
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: first.current ? 1.1 : 1.4, ease: "power2.out" }, 0)
        .from(split.words, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06 }, 0.45)
        .fromTo(flow, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.1 }, 0.3)
        .add(() => gsap.set(others, { autoAlpha: 0 }), first.current ? 1.4 : 1.5);

      gsap.fromTo(zoom, { scale: 1.12 }, { scale: 1, duration: HOLD + 1.5, ease: "power1.out" });
      first.current = false;
      entrance.current = { tl, split };

      return undefined;
    },
    { dependencies: [at], scope: root },
  );

  // The progress rings: empty, except the current slide's, which fills as the time to the next change runs out.
  useGSAP(
    () => {
      const bars = gsap.utils.toArray("[data-bar]", root.current);
      bars.forEach((b) => gsap.set(b, { strokeDashoffset: 100 }));
      // Only one slide's line may be counting: a click mid-slide must not leave the old line running,
      // or it would finish later and push the show on a second time.
      timer.current?.kill();
      if (still || count < 2) return;
      timer.current = gsap.to(bars[at], { strokeDashoffset: 0, duration: HOLD, ease: "none", onComplete: () => go(at + 1) });
    },
    { dependencies: [at], scope: root },
  );

  // Hold only while the tab is out of sight; the mouse never stops it.
  useEffect(() => {
    const t = timer.current;
    if (!t) return;
    if (hidden) t.pause();
    else t.resume();
  }, [hidden, at]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go(at + 1);
    if (e.key === "ArrowLeft") go(at - 1);
  };

  return (
    <div ref={root} className={cn("relative", FULL)} aria-roledescription="carousel" aria-label="Quivogue campaigns" onKeyDown={onKeyDown}>
      {/* Campaign: the pictures fill the screen, stacked, the current one on top */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div key={s.id} data-visual className={cn("absolute inset-0", i !== 0 && "invisible")} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== at || undefined}>
            {mounted.has(i) && <Visual slide={s} eager={i === 0} />}
          </div>
        ))}
      </div>
      {/* Shade: dark at the bottom and on the left so the words stay readable, clear at the top right */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_top,rgb(10_14_13/0.82)_0%,rgb(10_14_13/0.38)_42%,rgb(10_14_13/0.12)_70%,rgb(10_14_13/0.34)_100%)]" aria-hidden="true" />

      {/* Film grain over the pictures, under the words */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden="true"><div className="grain" /></div>

      {/* Words: every slide's words share one cell, so the page never jumps */}
      <div className={cn("wrap relative z-[4] flex flex-col justify-end pb-24 pt-32 sm:pb-28 lg:pb-32", FULL)}>
        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
          {slides.map((s, i) => (
            <div key={s.id} data-copy={i} className={cn("flex max-w-2xl flex-col justify-end", i !== at && "invisible")} aria-hidden={i !== at || undefined}>
              <h2 data-title className="font-display text-[clamp(2.1rem,5vw,4.2rem)] font-normal leading-[1.05] tracking-[-0.02em] text-cream">
                {s.title}
              </h2>
              <p data-flow className="mt-3 max-w-xl text-[1rem] leading-snug text-cream/90 sm:mt-4 sm:text-[1.2rem]">{s.text}</p>
              <div data-flow className="mt-6 sm:mt-9">
                <Link className="inline-flex min-h-12 items-center rounded-full bg-cream px-6 text-[0.92rem] font-medium text-ink transition-colors duration-300 hover:bg-white" to={s.href} tabIndex={i === at ? 0 : -1}>{s.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress: one small ring per slide, bottom right; the current ring fills over the time until the next change */}
      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]">
          <div className="wrap flex justify-end pb-24 sm:pb-28 lg:pb-32">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink/55 px-2 backdrop-blur-sm" role="tablist" aria-label="Choose a slide">
              {slides.map((s, i) => (
                <button key={s.id} type="button" role="tab" aria-selected={i === at} aria-label={s.title} className="grid h-12 w-11 place-items-center" onClick={() => go(i)}>
                  <svg className="h-[22px] w-[22px] -rotate-90" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" className={cn("transition-colors duration-500", i === at ? "text-cream/35" : "text-cream/25")} />
                    <circle data-bar cx="12" cy="12" r="9.5" pathLength="100" strokeDasharray="100" strokeDashoffset="100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cream" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One campaign picture with a single model. The shoot is three portraits side
 * by side; only the middle one is shown, full height, standing right of centre
 * (centred on a phone). The same photograph, blurred and darkened, fills the
 * rest of the screen so the frame stays full without a second person in it.
 */
function Visual({ slide, eager }) {
  const src = slide.photo ? photoSources(slide.photo, { wide: true }) : null;
  if (!src) return <div className="h-full w-full bg-sand-100" />;
  const img = { src: src.src, srcSet: src.srcSet, alt: "", width: src.width, height: src.height, loading: eager ? "eager" : "lazy", decoding: "async" };
  return (
    <div data-panel className="absolute inset-0 overflow-hidden bg-ink">
      <div data-zoom className="absolute inset-0">
        {/* Backdrop: the whole shoot, softened */}
        <img className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-3xl brightness-50" sizes="40vw" aria-hidden="true" {...img} />
        {/* The model: the middle third of the shoot, full height */}
        <div className="absolute inset-y-0 left-1/2 aspect-[800/1533] -translate-x-1/2 overflow-hidden lg:left-auto lg:right-[10%] lg:translate-x-0">
          <img
            className="absolute inset-y-0 left-0 h-full w-[300%] max-w-none -translate-x-1/3 object-cover contrast-[1.06] saturate-[1.05]"
            sizes="(min-width: 1024px) 160vh, 300vw"
            fetchPriority={eager ? "high" : undefined}
            {...img}
            alt={slide.title}
          />
        </div>
      </div>
    </div>
  );
}
