/* Toggle */
import { useId } from "react";

import { cn } from "@/utils/cn";

// An on/off switch with its label: "Live on the site", "Active".
export default function Toggle({ checked, onChange, label, hint, disabled = false, className }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 flex-none rounded-r-pill transition-colors disabled:opacity-50", checked ? "bg-brand-500" : "bg-line-2")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sh-1 transition-transform", checked && "translate-x-5")} />
      </button>
      {(label || hint) && (
        <label htmlFor={id} className="cursor-pointer">
          {label && <span className="block text-sm font-semibold text-ink-2">{label}</span>}
          {hint && <span className="block text-xs text-ink-3">{hint}</span>}
        </label>
      )}
    </div>
  );
}
