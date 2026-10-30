/* Hero */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import { photoSources } from "@/utils/media";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

gsap.registerPlugin(useGSAP, SplitText);

// How long each slide holds, in seconds.
const HOLD = 6;
const prefersStill = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const pad = (n) => String(n).padStart(2, "0");
// The promo bar above the header is 36px tall; the hero fills the rest of the first screen.
const FULL = "min-h-[calc(100svh-36px)]";

/**
 * The hero: the campaign photograph fills the whole first screen. A soft
 * shade from the bottom and the left keeps the words readable, and the header
 * turns white over it. Each campaign has a short line in script (calligraphy)
 * with a flourish that draws itself, above the headline in Anton. A new
 * campaign fades up while its picture settles from a slight zoom and its words
 * lift into place; the lines along the bottom fill left to right and pick a
 * slide. Keeps playing under the mouse, holds only while the tab is hidden,
 * steps with the arrow keys, and stays still for reduced motion.
 */
export default function Hero({ slides }) {
  return (
    <section className={cn("relative -mt-[72px] overflow-hidden bg-ink text-cream lg:-mt-[84px]", FULL)}>
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

  // The entrance: the picture fades up and settles, the script and its flourish are written, the words lift into place.
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
      const script = copy.querySelector("[data-script]");
      const swash = copy.querySelector("[data-swash]");
      const others = visuals.filter((v) => v !== visual);

      gsap.set(visual, { autoAlpha: 1, zIndex: 2 });
      gsap.set(others, { zIndex: 1 });

      if (still) {
        gsap.set(others, { autoAlpha: 0 });
        gsap.set(flow, { opacity: 1, y: 0 });
        gsap.set(swash, { strokeDashoffset: 0 });
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
        // The script is written in from left to right, then its flourish is drawn under it.
        .fromTo(script, { clipPath: "inset(-10% 100% -30% 0)" }, { clipPath: "inset(-10% 0% -30% 0)", duration: 1.5, ease: "power2.inOut" }, 0.5)
        .fromTo(swash, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 1.2)
        .add(() => gsap.set(others, { autoAlpha: 0 }), first.current ? 1.4 : 1.5);

      gsap.fromTo(zoom, { scale: 1.12 }, { scale: 1, duration: HOLD + 1.5, ease: "power1.out" });
      first.current = false;
      entrance.current = { tl, split };

      return undefined;
    },
    { dependencies: [at], scope: root },
  );

  // The progress lines: full behind the current slide, filling on it.
  useGSAP(
    () => {
      const bars = gsap.utils.toArray("[data-bar]", root.current);
      bars.forEach((b, i) => gsap.set(b, { scaleX: i < at ? 1 : 0 }));
      // Only one slide's line may be counting: a click mid-slide must not leave the old line running,
      // or it would finish later and push the show on a second time.
      timer.current?.kill();
      if (still || count < 2) return;
      timer.current = gsap.to(bars[at], { scaleX: 1, duration: HOLD, ease: "none", onComplete: () => go(at + 1) });
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
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_top,rgb(10_14_13/0.82)_0%,rgb(10_14_13/0.38)_42%,rgb(10_14_13/0.12)_70%,rgb(10_14_13/0.34)_100%),linear-gradient(to_right,rgb(10_14_13/0.5)_0%,transparent_62%)]" aria-hidden="true" />

      {/* Words: every slide's words share one cell, so the page never jumps */}
      <div className={cn("wrap relative z-[4] flex flex-col justify-end pb-24 pt-32 sm:pb-28 lg:pb-32", FULL)}>
        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
          {slides.map((s, i) => (
            <div key={s.id} data-copy={i} className={cn("flex max-w-2xl flex-col", i !== at && "invisible")} aria-hidden={i !== at || undefined}>
              <p data-flow className="kicker mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 !text-cream/80 sm:mb-4">
                <span>{s.kicker.replaceAll(" · ", " · ")}</span>
                {s.sticker && <span className="border border-cream/70 px-2.5 py-1 text-[0.75rem] font-medium normal-case tracking-[0.02em] text-cream">{s.sticker}</span>}
              </p>
              {s.script && (
                <div className="relative mb-1 self-start sm:mb-2">
                  {/* Calligraphy: written in, then underlined with a flourish */}
                  <p data-script className="m-0 -rotate-2 pr-6 font-script text-[clamp(3rem,9vw,6.5rem)] leading-[1.1] text-[#f6c9dd]">{s.script}</p>
                  <svg className="-mt-1 block h-5 w-full text-[#f6c9dd] sm:h-6" viewBox="0 0 300 24" preserveAspectRatio="none" fill="none" aria-hidden="true">
                    <path data-swash pathLength="1" strokeDasharray="1" strokeDashoffset="1" d="M3 17 C 38 4, 86 22, 140 11 S 232 3, 297 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              )}
              <h2 data-title className="font-logo text-[clamp(2.3rem,6.4vw,5.6rem)] font-normal uppercase leading-[0.98] tracking-[0.04em] text-cream">
                {s.title}
              </h2>
              <p data-flow className="mt-4 max-w-md text-[1rem] leading-relaxed text-cream/85 sm:mt-6 sm:text-[1.08rem]">{s.text}</p>
              <div data-flow className="mt-6 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
                <Link className="btn btn--primary btn--lg text-center" to={s.href} tabIndex={i === at ? 0 : -1}>{s.cta}</Link>
                <Link className="btn btn--lg border-cream/70 text-center text-cream hover:bg-cream hover:text-ink" to="/about" tabIndex={i === at ? 0 : -1}>{t("Our story")}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress: one line per slide along the bottom, filling left to right; each picks its slide */}
      <div className="absolute inset-x-0 bottom-0 z-[5]">
        <div className="wrap pb-5 lg:pb-8" role="tablist" aria-label="Choose a slide">
          <div className="grid gap-3 sm:gap-4 lg:max-w-xl" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => (
              <button key={s.id} type="button" role="tab" aria-selected={i === at} aria-label={s.title} className="group flex min-h-11 flex-col justify-end gap-2.5 text-left" onClick={() => go(i)}>
                <span className={cn("hidden text-[0.85rem] tabular-nums transition-colors duration-500 lg:block", i === at ? "text-cream" : "text-cream/50 group-hover:text-cream/80")}>{pad(i + 1)}</span>
                <span className="relative block h-px w-full overflow-hidden bg-cream/30">
                  <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-cream" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One campaign picture, filling the screen. The shoot is three portraits side
 * by side; on a wide screen all three show, and on a phone the frame settles
 * on the middle one.
 */
function Visual({ slide, eager }) {
  const src = slide.photo ? photoSources(slide.photo, { wide: true }) : null;
  if (!src) return <div className="h-full w-full bg-sand-100" />;
  return (
    <div data-panel className="absolute inset-0 overflow-hidden bg-ink">
      <div data-zoom className="absolute inset-0">
        <img
          className="h-full w-full object-cover object-[50%_28%]"
          src={src.src}
          srcSet={src.srcSet}
          sizes="100vw"
          alt={slide.title}
          width={src.width}
          height={src.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : undefined}
        />
      </div>
    </div>
  );
}
