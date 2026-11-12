/* Button */
import { LoaderCircle } from "lucide-react";

import { cn } from "@/utils/cn";

// Quivogue's button classes (formerly styles/quivogue.css, now removed): a gradient primary, a
// white ghost, a soft brand tint.
const VARIANTS = {
  primary: "btn--primary",
  ghost: "btn--ghost",
  soft: "btn--soft",
  danger: "btn--danger",
};

export default function Button({ variant = "primary", block = false, loading = false, className, children, disabled, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn("btn", VARIANTS[variant], block && "btn--block", className)}
      {...rest}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
