/* Slideshow State (from Quivogue initSlideshow()) */
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL = 6000;
// The dip to black between slides; must match the .slide transition in
// styles/quivogue.css.
const DIP = 420;

const prefersStill = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Which slide is showing, whether it is lit, and which pictures are mounted.
 *
 * - Auto-advances every 6s; pauses on hover, on focus and while the tab is
 *   hidden; never auto-advances for reduced motion.
 * - Every slide sits in the same box, so loading="lazy" cannot help: a slide's
 *   picture mounts only when it is reached, plus one ahead, so the dip to
 *   black never reveals an empty frame.
 */
export function useSlideshow(count) {
  const [at, setAt] = useState(0);
  const [lit, setLit] = useState(false);
  const [mounted, setMounted] = useState(() => new Set([0, 1]));
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [still] = useState(prefersStill);
  const dip = useRef(null);

  // The first slide lights a frame late, so its push-in animates like every
  // other slide's instead of starting already settled.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const go = useCallback(
    (n) => {
      if (!count) return;
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

  // Don't burn cycles rotating a hero nobody is looking at.
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

  return { at, lit, mounted, go, pause: () => setPaused(true), resume: () => setPaused(false) };
}
