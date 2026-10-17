/* Form Guard */
import { ApiError } from "./mock";

/**
 * A light check on public forms (sign-up, contact, newsletter, guest
 * returns) against bots (gap A4): a hidden field people never fill in, and
 * a form sent faster than a person could fill it in. The API adds rate
 * limits per address on top.
 */
export interface Guard {
  /** The hidden "website" field; only bots fill it in. */
  hp?: string;
  /** When the form appeared, in ms. */
  startedAt?: number;
}

const MIN_MS = 1200;

export function assertHuman(guard?: Guard) {
  if (!guard) return;
  if (guard.hp) throw new ApiError("Something went wrong. Please try again.", 422);
  if (guard.startedAt && Date.now() - guard.startedAt < MIN_MS) throw new ApiError("That was quick. Please try again.", 429);
}
