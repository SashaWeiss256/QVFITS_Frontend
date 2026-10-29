/* Info Card */
import { cn } from "@/utils/cn";

// A white panel with a hairline, for the checkout steps and order lookups.
export default function InfoCard({ as: Tag = "div", className, ...rest }) {
  return <Tag className={cn("border border-line bg-white p-[clamp(22px,3.2vw,40px)]", className)} {...rest} />;
}
