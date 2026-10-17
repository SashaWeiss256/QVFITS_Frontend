/* Admin Panel */
import { cn } from "@/utils/cn";

// One white surface on the cream page: an optional heading row with a short
// hint and a link or control on the right, then the content.
export default function Panel({ title, hint, action, flush = false, className, children }) {
  return (
    <section className={cn("rounded-r-lg border border-line bg-white", !flush && "p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", flush && "mb-0 border-b border-line px-5 py-4 sm:px-6")}>
          <div className="min-w-0">
            {title && <h2 className="m-0 text-[1.05rem] font-bold tracking-tight">{title}</h2>}
            {hint && <p className="m-0 mt-0.5 text-[.82rem] text-ink-4">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
