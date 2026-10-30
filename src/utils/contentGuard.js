/* Content Guard */
import { useEffect } from "react";

// Quiet deterrents so the photographs and words are not lifted with a casual
// click. A browser can never truly stop a screenshot or a saved image (and a
// phone's screenshot button cannot be seen at all), so this raises the effort;
// it does not make copying impossible. Forms and text fields are left alone,
// and the shop's own admin never loads this.
const FIELD = "input, textarea, select, [contenteditable='true']";
const inField = (e) => e.target instanceof Element && Boolean(e.target.closest(FIELD));

export function useContentGuard() {
  useEffect(() => {
    const on = (type, fn, opt) => {
      document.addEventListener(type, fn, opt);
      return () => document.removeEventListener(type, fn, opt);
    };

    // The pictures are covered while the window is not in front, which is when a snipping tool is opened.
    const cover = (on_) => document.documentElement.toggleAttribute("data-covered", on_);
    const hidden = () => cover(document.hidden);

    const stops = [
      // Right click and long press menu, and dragging a picture out
      on("contextmenu", (e) => !inField(e) && e.preventDefault()),
      on("dragstart", (e) => e.target instanceof Element && e.target.closest("img, video") && e.preventDefault()),
      // Copying page text (fields are exempt so shoppers can still paste and copy their own details)
      on("copy", (e) => !inField(e) && e.preventDefault()),
      // Save, print and view source; the Print Screen key empties the clipboard and covers the pictures for a moment
      on("keydown", (e) => {
        const mod = e.ctrlKey || e.metaKey;
        const k = e.key.toLowerCase();
        if (e.key === "PrintScreen") {
          navigator.clipboard?.writeText("").catch(() => {});
          cover(true);
          setTimeout(() => cover(false), 1200);
        }
        if (mod && ["s", "p", "u"].includes(k) && !inField(e)) e.preventDefault();
        if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k)) {
          cover(true);
          setTimeout(() => cover(false), 1200);
        }
      }),
      on("visibilitychange", hidden),
    ];
    const blur = () => cover(true);
    const focus = () => cover(false);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      stops.forEach((off) => off());
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      cover(false);
    };
  }, []);
}
