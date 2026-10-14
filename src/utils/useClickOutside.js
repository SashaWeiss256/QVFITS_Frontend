/* Click Outside */
import { useEffect } from "react";

/** Calls `onOutside` on a pointer press outside `ref`, or on Escape, while `active`. */
export function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onPointer = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
    const onKey = (e) => e.key === "Escape" && onOutside();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onOutside, active]);
}
