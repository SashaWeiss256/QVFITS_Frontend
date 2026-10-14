/* Form Field */
import { useId } from "react";

import { cn } from "@/utils/cn";

/**
 * Label, control and error in one place, wired for screen readers. Pass a
 * react-hook-form `register(...)` result as `input`, `options` for a select,
 * or a custom control as children(id).
 */
export default function Field({ label, error, hint, as, options, input, className, children, ...rest }) {
  const id = useId();
  const Control = as ?? (options ? "select" : "input");
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {typeof children === "function" ? children(id) : (
        <Control
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn("input", as === "textarea" && "min-h-32 resize-y")}
          {...input}
          {...rest}
        >
          {options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Control>
      )}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="m-0 text-xs font-semibold text-warn">{error}</p>}
    </div>
  );
}
