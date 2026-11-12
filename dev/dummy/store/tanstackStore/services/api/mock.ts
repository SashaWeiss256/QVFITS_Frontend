/* Mock Transport */

/**
 * The site still answers from fixtures. Services import `mockApi` here and
 * will import `http` from `./client` instead, one module at a time, as the
 * backend starts serving each route. Both throw the same ApiError, and both
 * honour an AbortSignal, so a cancelled query behaves the same either way.
 */

import { ApiError } from "./error";

export { ApiError };

export function mockDelay(ms = 250, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(aborted());
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(aborted());
      },
      { once: true },
    );
  });
}

export async function mockApi<T>(resolver: () => T | Promise<T>, ms = 250, signal?: AbortSignal): Promise<T> {
  await mockDelay(ms, signal);
  return resolver();
}

function aborted() {
  return new DOMException("The request was cancelled.", "AbortError");
}
