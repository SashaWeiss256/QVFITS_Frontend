/* Class Names */
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// bg-brand-grad is our own utility (index.css); it is a background image, not a colour.
const twMerge = extendTailwindMerge({ extend: { classGroups: { "bg-image": ["bg-brand-grad"] } } });

// Resolve conditional class names first, then let later Tailwind utilities override conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
