/* Admin Panel */
import { cn } from "@/utils/cn";

export default function Panel({ title, className, children }) {
  return (
    <section className={cn("rounded-r-lg bg-white p-6 shadow-sh-1", className)}>
      {title && <h2 className="mb-4 text-[1.1rem]">{title}</h2>}
      {children}
    </section>
  );
}
