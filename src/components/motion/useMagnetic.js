/* Magnetic Buttons */
import { useEffect } from "react";

// How far a large button leans toward the pointer, in pixels, and how near the pointer must be.
const PULL = 7;
const REACH = 70;

/**
 * Large buttons lean a few pixels toward the pointer as it nears them and
 * settle back when it leaves, which gives the main actions a little weight.
 * One listener for the whole page. Mouse only: touch and pen never trigger
 * it, and it stays off for anyone who asked for reduced motion.
 */
export function useMagnetic() {
  useEffect(() => {
    const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return undefined;

    let current = null;
    const release = () => {
      if (!current) return;
      current.style.setProperty("--mx", "0px");
      current.style.setProperty("--my", "0px");
      current = null;
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target instanceof Element ? e.target.closest(".btn--lg") : null;
      // Also catch the pointer just outside the button's edge.
      const near = el ?? (current && inReach(current, e) ? current : null);
      if (!near) return release();
      if (current && current !== near) release();
      current = near;
      const r = near.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      near.style.setProperty("--mx", `${(Math.max(-1, Math.min(1, dx)) * PULL).toFixed(1)}px`);
      near.style.setProperty("--my", `${(Math.max(-1, Math.min(1, dy)) * PULL * 0.6).toFixed(1)}px`);
    };
    const inReach = (el, e) => {
      const r = el.getBoundingClientRect();
      return e.clientX > r.left - REACH && e.clientX < r.right + REACH && e.clientY > r.top - REACH && e.clientY < r.bottom + REACH;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", release);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      release();
    };
  }, []);
}
