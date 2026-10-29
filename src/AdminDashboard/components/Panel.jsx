/* Admin Panel */
import { cn } from "@/utils/cn";

// One white surface on the cream page: an optional heading row with a short
// hint and a link or control on the right, then the content.
export default function Panel({ id, title, hint, action, flush = false, className, children }) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-[22px] border border-line bg-white shadow-sh-1", flush ? "overflow-hidden" : "p-6 sm:p-8", className)}>
      {(title || action) && (
        <div className={cn("mb-6 flex flex-wrap items-start justify-between gap-3", flush && "mb-0 border-b border-line px-5 py-4 sm:px-6")}>
          <div className="min-w-0">
            {title && <h2 className="m-0 font-display text-[1.25rem] font-medium leading-tight tracking-[-0.01em]">{title}</h2>}
            {hint && <p className="m-0 mt-1.5 max-w-[62ch] text-[.88rem] leading-relaxed text-ink-3">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
