/* Skeleton */
import { cn } from "@/utils/cn";

/** A shimmering placeholder shaped like what is loading. */
export default function Skeleton({ className }) {
  return <div className={cn("skel", className)} aria-hidden="true" />;
}

/** A product grid's worth of placeholder cards. */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid-products" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="mt-4 h-3 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
