/* Local Storage */

// Private mode and full or blocked storage all throw; a failed read falls
// back, a failed write lasts for this visit only.
export function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: nothing to do.
  }
}
