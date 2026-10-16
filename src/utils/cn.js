/* Class Names */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Resolve conditional class names first, then let later Tailwind utilities override conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
