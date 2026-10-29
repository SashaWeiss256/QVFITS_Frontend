/* Rounded UI */
import { useEffect } from "react";

// The dashboards (admin and customer account) use pill buttons and softly
// rounded fields. The shop keeps its own sharper look, so the switch is a
// class on the page root that only these areas turn on, and off again on leave.
export function useRoundedUi() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("ui-round");
    return () => root.classList.remove("ui-round");
  }, []);
}
