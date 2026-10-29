/* Sub Heading */
import { cn } from "@/utils/cn";

// The heading inside a checkout card or the order summary.
export default function SubHeading({ className, ...rest }) {
  return <h2 className={cn("mb-[1.1rem] font-display text-[1.3rem] leading-[1.2] text-ink", className)} {...rest} />;
}
