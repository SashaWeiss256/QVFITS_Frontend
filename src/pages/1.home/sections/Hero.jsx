/* Hero Slideshow (from Quivogue index.html, section 1) */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";

const INTERVAL = 6000;
// The dip to black between slides; matches the .slide transition in quivogue.css.
const DIP = 420;
const prefersStill = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * A rotating canvas of photographs inside the page width, copy centred over
 * the picture, as on the original site. Auto-advances every 6s; pauses on
 * hover, on focus and while the tab is hidden; never moves for reduced
 * motion. A slide's picture mounts only when it is reached, plus one ahead,
 * so the dip to black never reveals an empty frame.
 */
export default function Hero({ slides }) {
  return (
    <section className="hero">
      <div className="wrap">
        {/* The slides' own titles rotate, so the page carries one h1 that does not. */}
        <h1 className="sr-only">QVFITS: seamless activewear, swim and lounge, Kampala</h1>
        {/* The frame holds its height while the slides load, so nothing below jumps. */}
        {slides?.length ? <Slideshow slides={slides} /> : <div className="slideshow" aria-hidden="true" />}
      </div>
    </section>
  );
}

function Slideshow({ slides }) {
  const count = slides.length;
  const [at, setAt] = useState(0);
  const [lit, setLit] = useState(false);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [still] = useState(prefersStill);
  const dip = useRef(null);

  // The first slide lights a frame late, so its push-in animates like the rest.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const go = useCallback(
    (n) => {
      const next = (n + count) % count;
      setAt(next);
      setMounted((m) => new Set([...m, next, (next + 1) % count]));
      if (still) return;
      // Down to black, then back up on the new slide.
      clearTimeout(dip.current);
      setLit(false);
      dip.current = setTimeout(() => setLit(true), DIP);
    },
    [count, still],
  );

  useEffect(() => () => clearTimeout(dip.current), []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (still || paused || hidden || count < 2) return undefined;
    const timer = setInterval(() => go(at + 1), INTERVAL);
    return () => clearInterval(timer);
  }, [at, go, still, paused, hidden, count]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go(at + 1);
    if (e.key === "ArrowLeft") go(at - 1);
  };

  return (
    <div
      className="slideshow"
      aria-roledescription="carousel"
      aria-label="QVFITS campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="slideshow__track">
        {slides.map((s, i) => {
          const active = i === at;
          return (
            <div
              key={s.id}
              className={cn("slide", active && lit && "is-on")}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active || undefined}
            >
              <div className="slide__media">{mounted.has(i) && <Photo photo={s.photo} label={s.title} eager={i === 0} wide />}</div>
              {s.sticker && <span className="slide__sticker">{s.sticker}</span>}
              <div className="slide__body">
                <span className="kicker">{s.kicker}</span>
                <h2 className="slide__title">{s.title}</h2>
                <p className="lede">{s.text}</p>
                <Link className="btn btn--primary btn--lg" to={s.href} tabIndex={active ? 0 : -1}>{s.cta}</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="slideshow__dots" role="tablist" aria-label="Choose a slide">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === at}
            aria-label={s.title}
            className={cn("slideshow__dot", i === at && "is-on")}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
