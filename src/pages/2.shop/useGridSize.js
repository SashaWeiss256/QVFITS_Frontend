/* Shop Grid Size */
import { useCallback, useEffect, useState } from "react";

import { readStored, writeStored } from "@/utils/storage";

const KEY = "qvfits:shop:grid";
// What each screen offers: one or two on a phone, two or three on a tablet, three or four on a laptop.
export const GRID_CHOICES = { phone: [1, 2], tablet: [2, 3], desktop: [3, 4] };
const FALLBACK = { phone: 2, tablet: 3, desktop: 4 };

const screenOf = () => (window.matchMedia("(min-width: 1024px)").matches ? "desktop" : window.matchMedia("(min-width: 640px)").matches ? "tablet" : "phone");

/**
 * Products per row on the shop page. The admin sets the default for each
 * screen (Settings, Shop display); a shopper's own choice is remembered in
 * the browser per screen, so a phone and a laptop keep their own.
 */
export function useGridSize(defaults) {
  const [screen, setScreen] = useState(screenOf);
  const [chosen, setChosen] = useState(() => readStored(KEY, {}));

  useEffect(() => {
    const queries = ["(min-width: 640px)", "(min-width: 1024px)"].map((q) => window.matchMedia(q));
    const onChange = () => setScreen(screenOf());
    queries.forEach((q) => q.addEventListener("change", onChange));
    return () => queries.forEach((q) => q.removeEventListener("change", onChange));
  }, []);

  const options = GRID_CHOICES[screen];
  const wanted = chosen[screen] ?? defaults?.[screen] ?? FALLBACK[screen];
  const cols = options.includes(wanted) ? wanted : FALLBACK[screen];

  const setCols = useCallback(
    (n) =>
      setChosen((prev) => {
        const next = { ...prev, [screen]: n };
        writeStored(KEY, next);
        return next;
      }),
    [screen],
  );

  return { cols, options, setCols };
}
