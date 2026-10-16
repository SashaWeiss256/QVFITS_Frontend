/* Mega Menu Hover */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hover intent for the mega menu: opens after a short pause on "Shop", stays
 * open while the pointer travels into the panel, closes a beat after it
 * leaves both. Click and keyboard toggle it; Escape closes it, and every
 * link inside closes it on click (MegaMenu's onNavigate).
 */
export function useMegaMenuHover() {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const clear = () => clearTimeout(timer.current);
  const enter = useCallback(() => {
    clear();
    timer.current = setTimeout(() => setOpen(true), 90);
  }, []);
  const leave = useCallback(() => {
    clear();
    timer.current = setTimeout(() => setOpen(false), 180);
  }, []);
  const close = useCallback(() => {
    clear();
    setOpen(false);
  }, []);
  const toggle = useCallback(() => {
    clear();
    setOpen((o) => !o);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => clear(), []);

  return { open, enter, leave, close, toggle };
}
