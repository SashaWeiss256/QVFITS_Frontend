/* Idle Sign-Out (port of belioras useIdleTimeout) */
import { useCallback, useEffect, useRef, useState } from "react";

/** Activity worth counting. Deliberately not mousemove, see the throttle. */
const EVENTS = ["pointerdown", "keydown", "scroll", "wheel", "touchstart", "focus"];

/** Once every 30s is enough to keep a working session alive. */
const THROTTLE = 30_000;

/**
 * Sign someone out after a period of inactivity.
 *
 * Admin sessions should be short; shopper sessions should not. This is the
 * client half of that (the real token lifetime is server-side and arrives
 * with the backend), and it is what an admin actually experiences: an
 * unattended dashboard, on a laptop left open in the showroom, does not stay
 * signed in indefinitely.
 *
 * A warning precedes the sign-out rather than replacing it. Expiring silently
 * mid-sentence in a product description is a good way to make people distrust
 * the tool; being told is the difference between a policy and a bug.
 *
 * No state is written from the effect body: `schedule` only arms timers, and
 * `warning` is set by the timer or cleared by a real interaction, both of
 * which are outside render.
 */

export function useIdleTimeout({
  timeout = 30 * 60 * 1000,
  warnBefore = 2 * 60 * 1000,
  onIdle,
} = {}) {
  const [warning, setWarning] = useState(false);

  const timers = useRef({ idle: null, warn: null });

  const lastActivity = useRef(0);

  // Held in a ref so a caller passing an inline arrow does not rebuild the
  // listeners and restart the countdown on every render.
  const onIdleRef = useRef(onIdle);
  /* Idle Detection */
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const clear = useCallback(() => {
    clearTimeout(timers.current.idle);
    clearTimeout(timers.current.warn);
  }, []);

  /** Arms the timers. Pure with respect to React state. */
  const schedule = useCallback(() => {
    clear();
    timers.current.warn = setTimeout(() => setWarning(true), Math.max(0, timeout - warnBefore));
    timers.current.idle = setTimeout(() => {
      setWarning(false);
      onIdleRef.current?.();
    }, timeout);
  }, [clear, timeout, warnBefore]);

  /** Someone is here: dismiss any warning and start the clock again. */
  const extend = useCallback(() => {
    lastActivity.current = Date.now();
    setWarning(false);
    schedule();
  }, [schedule]);

  /* Side Effect */
  useEffect(() => {
    lastActivity.current = Date.now();
    schedule();

    const onActivity = () => {

      const now = Date.now();
      // Throttled, so a scroll does not rebuild the timers on every frame.
      if (now - lastActivity.current < THROTTLE) return;
      lastActivity.current = now;
      // Only touch state if there is a warning to clear.
      setWarning((shown) => (shown ? false : shown));
      schedule();
    };

    EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true, capture: true }),
    );

    return () => {
      EVENTS.forEach((event) => window.removeEventListener(event, onActivity, { capture: true }));
      clear();
    };
  }, [schedule, clear]);

  return { warning, extend };
}
