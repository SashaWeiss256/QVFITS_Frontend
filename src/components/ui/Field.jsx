/* Form Field */
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Label, control and error in one place, wired for screen readers. Pass a
 * react-hook-form `register(...)` result as `input`, `options` for a select,
 * or a custom control as children(id). A `type="password"` field gets a
 * show and hide button inside it, so a typo can be spotted before sending.
 */
export default function Field({ label, error, hint, as, options, input, className, children, ...rest }) {
  const id = useId();
  const Control = as ?? (options ? "select" : "input");
  const secret = rest.type === "password" && !as && !options;
  const [shown, setShown] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[.82rem] font-medium text-ink-3">
        {label}
      </label>
      {typeof children === "function" ? children(id) : (
        <div className={cn(secret && "relative")}>
          <Control
            id={id}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={cn(options ? "select w-full" : "input", as === "textarea" && "min-h-32 resize-y", secret && "pr-12")}
            {...input}
            {...rest}
            type={secret && shown ? "text" : rest.type}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Control>
          {secret && (
            <button
              type="button"
              className="absolute top-1/2 right-1 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink-3 outline-none transition-colors duration-150 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-300"
              aria-label={shown ? "Hide password" : "Show password"}
              aria-pressed={shown}
              onClick={() => setShown((v) => !v)}
            >
              {shown ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
      {hint && !error && <p id={`${id}-hint`} className="m-0 text-xs text-ink-3">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="m-0 text-xs font-semibold text-warn">{error}</p>}
    </div>
  );
}
