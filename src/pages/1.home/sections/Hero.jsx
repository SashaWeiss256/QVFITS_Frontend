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
const HOLD = 8;
const prefersStill = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const pad = (n) => String(n).padStart(2, "0");

// The three panels of a triptych sit at different heights, like pieces on a wall.
const DROP = ["", "pt-7 lg:pt-14", "pt-3 lg:pt-6"];

/**
 * The hero. The page's own cream fills the screen so the pictures stay clear
 * and bright: nothing is laid over a photograph, and the brand gradient is
 * kept for the main button. Words sit on the left, the
 * campaign on the right (on a phone the pictures come first, then the words). Most campaign pictures are three portraits side by
 * side, so each portrait gets its own tall panel at its own height; a picture
 * that is not a triptych fills one tall panel instead. A new campaign rises
 * panel by panel while its words lift into place; the progress lines under
 * the words fill left to right and pick a slide. Keeps playing under the
 * mouse, holds only while the tab is hidden, steps with the arrow keys, and stays still for
 * reduced motion.
 */
export default function Hero({ slides }) {
  return (
    <section className="relative -mt-[72px] overflow-hidden bg-cream pt-[72px] text-ink lg:-mt-[84px] lg:pt-[84px]">
      {/* The slides' own titles rotate, so the page carries one h1 that does not. */}
      <h1 className="sr-only">Quivogue (QVFITS): premium seamless activewear, swim and lounge wear, Kampala</h1>
      {slides?.length ? <Slideshow slides={slides} /> : <div className="min-h-[calc(100svh-72px)]" />}
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

  // The entrance: panels rise one after another, the words lift into place.
  useGSAP(
    () => {
      const visuals = gsap.utils.toArray("[data-visual]", root.current);
      const visual = visuals[at];
      const copy = root.current.querySelector(`[data-copy="${at}"]`);
      if (!visual || !copy) return undefined;
      const panels = visual.querySelectorAll("[data-panel]");
      const zooms = visual.querySelectorAll("[data-zoom]");
      const title = copy.querySelector("[data-title]");
      const flow = copy.querySelectorAll("[data-flow]");
      const others = visuals.filter((v) => v !== visual);

      gsap.set(visual, { autoAlpha: 1, zIndex: 2 });
      gsap.set(others, { zIndex: 1 });

      if (still) {
        gsap.set(others, { autoAlpha: 0 });
        gsap.set(panels, { clipPath: "inset(0% 0 0 0)" });
        gsap.set(flow, { opacity: 1, y: 0 });
        return undefined;
      }

      // useGSAP leaves earlier animations running when the slide changes, so stop the last entrance and
      // un-split its words before this one starts (a title split twice would nest its words).
      entrance.current.tl?.kill();
      entrance.current.split?.revert();
      const split = SplitText.create(title, { type: "words,lines", mask: "lines" });
      const tl = gsap.timeline({ onComplete: () => gsap.set(others, { autoAlpha: 0 }) });
      tl.fromTo(panels, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut", stagger: first.current ? 0.16 : 0.12 }, 0)
        .fromTo(zooms, { scale: 1.16 }, { scale: 1, duration: HOLD + 1.5, ease: "power1.out", stagger: 0.12 }, 0)
        .from(split.words, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06 }, 0.35)
        .fromTo(flow, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.1 }, 0.55);
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
    <div
      ref={root}
      className="wrap grid min-h-[calc(100svh-72px)] items-center gap-6 py-10 sm:gap-10 lg:min-h-[calc(100svh-84px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-14"
      aria-roledescription="carousel"
      aria-label="Quivogue campaigns"
      onKeyDown={onKeyDown}
    >
      {/* Words: every slide's words share one cell, so the page never jumps */}
      <div className="order-3 flex flex-col lg:order-none lg:self-stretch lg:pr-4">
        <div className="grid flex-1 [&>*]:col-start-1 [&>*]:row-start-1">
        {slides.map((s, i) => (
          <div key={s.id} data-copy={i} className={cn("flex flex-col justify-center", i !== at && "invisible")} aria-hidden={i !== at || undefined}>
            <p data-flow className="kicker mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>{s.kicker.replaceAll(" \u00b7 ", "\u00a0\u00b7 ")}</span>
              {s.sticker && <span className="border border-brand-500 px-2.5 py-1 text-[0.75rem] font-medium normal-case tracking-[0.02em] text-brand-500">{s.sticker}</span>}
            </p>
            <h2 data-title className="font-logo text-[clamp(2.9rem,5.8vw,5.6rem)] font-normal uppercase leading-[0.98] tracking-[0.04em] text-ink">
              {s.title}
            </h2>
            <p data-flow className="mt-6 max-w-md text-[1.08rem] leading-relaxed text-ink-2">{s.text}</p>
            <div data-flow className="mt-9 flex flex-wrap items-center gap-4">
              <Link className="btn btn--primary btn--lg" to={s.href} tabIndex={i === at ? 0 : -1}>{s.cta}</Link>
              <Link className="btn btn--ghost btn--lg" to="/about" tabIndex={i === at ? 0 : -1}>{t("Our story")}</Link>
            </div>
          </div>
        ))}
        </div>

        {/* Progress: one line per slide, filling left to right; each picks its slide */}
        <div className="mt-10 hidden lg:block" role="tablist" aria-label="Choose a slide">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => (
              <button key={s.id} type="button" role="tab" aria-selected={i === at} aria-label={s.title} className="group flex min-h-11 flex-col justify-end gap-3 text-left" onClick={() => go(i)}>
                <span className={cn("text-[0.85rem] tabular-nums transition-colors duration-500", i === at ? "text-ink" : "text-ink-4 group-hover:text-ink-2")}>{pad(i + 1)}</span>
                <span className="relative block h-px w-full overflow-hidden bg-line-2">
                  <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-brand-grad" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign: the pictures, stacked, the current one on top */}
      <div className="relative order-1 h-[min(64svh,520px)] lg:order-none lg:h-[calc(100svh-84px-112px)] lg:max-h-[820px]">
        {slides.map((s, i) => (
          <div key={s.id} data-visual className={cn("absolute inset-0", i !== 0 && "invisible")} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== at || undefined}>
            {mounted.has(i) && <Visual slide={s} eager={i === 0} />}
          </div>
        ))}
      </div>

      {/* Progress on phones: the same lines, under the pictures */}
      <div className="order-2 grid gap-3 lg:hidden" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} role="tablist" aria-label="Choose a slide">
        {slides.map((s, i) => (
          <button key={s.id} type="button" role="tab" aria-selected={i === at} aria-label={s.title} className="flex min-h-11 items-end" onClick={() => go(i)}>
            <span className="relative block h-px w-full overflow-hidden bg-line-2">
              <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-brand-grad" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** One campaign: a triptych as three panels, anything else as one tall panel. */
function Visual({ slide, eager }) {
  const src = slide.photo ? photoSources(slide.photo, { wide: true }) : null;
  if (!src) return <div className="h-full w-full bg-sand-100" />;
  const label = slide.title;

  if (!slide.triptych) {
    return (
      <div data-panel className="relative h-full overflow-hidden bg-sand-100">
        <div data-zoom className="absolute inset-0">
          <img className="h-full w-full object-cover object-[50%_25%]" src={src.src} srcSet={src.srcSet} sizes="(min-width: 1024px) 700px, 100vw" alt={label} width={src.width} height={src.height} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
      {[0, 1, 2].map((n) => (
        <div key={n} className={cn("h-full", DROP[n])}>
          <div data-panel className="relative h-full overflow-hidden bg-sand-100">
            <div data-zoom className="absolute inset-0">
              {/* The whole picture at panel height, slid so panel n's third is centred */}
              <img
                className="absolute left-1/2 top-0 h-full w-auto max-w-none"
                style={{ transform: `translateX(-${((n + 0.5) / 3) * 100}%)` }}
                src={src.src}
                srcSet={src.srcSet}
                sizes="(min-width: 1024px) 1100px, 180vw"
                alt={n === 1 ? label : ""}
                width={src.width}
                height={src.height}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={eager && n === 1 ? "high" : undefined}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
