/* Page Loader */
import { cn } from "@/utils/cn";
import Skeleton, { SkeletonGrid } from "./Skeleton";

// A heading block in the shape every page opens with: a small label, the title, a line of text.
const Head = () => (
  <div className="mb-8">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-4 h-10 w-2/3 max-w-md" />
    <Skeleton className="mt-4 h-4 w-full max-w-lg" />
  </div>
);

// One white panel holding a few labelled fields, like the admin and checkout forms.
const Panel = ({ rows = 3 }) => (
  <div className="rounded-[22px] border border-line bg-white p-6">
    <Skeleton className="h-5 w-40" />
    <div className="mt-5 grid gap-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-12 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Each shape matches the screen it stands in for, so the page doesn't jump when the real one arrives.
const SHAPES = {
  // A storefront page: heading, then a grid of cards.
  page: () => (
    <div className="wrap section--tight">
      <Head />
      <SkeletonGrid count={4} />
    </div>
  ),
  // The product page: photos on the left, the buy panel on the right.
  product: () => (
    <div className="wrap section--tight grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <Skeleton className="aspect-[4/5] w-full" />
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-4 h-6 w-32" />
        <Skeleton className="mt-8 h-3 w-16" />
        <div className="mt-3 flex gap-2.5">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9 w-9 rounded-full" />)}</div>
        <Skeleton className="mt-8 h-3 w-16" />
        <div className="mt-3 flex gap-2.5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-11 w-14" />)}</div>
        <Skeleton className="mt-8 h-[54px] w-full" />
      </div>
    </div>
  ),
  // Long reading text, like the legal pages.
  text: () => (
    <div className="wrap section--tight max-w-3xl">
      <Head />
      {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className={cn("mb-3 h-4", i % 4 === 3 ? "w-2/3" : "w-full")} />)}
    </div>
  ),
  // Forms and detail pages: a couple of panels.
  form: () => (
    <div className="grid gap-5">
      <Panel />
      <Panel rows={2} />
    </div>
  ),
  // A list of rows, like orders or the Shop by groups.
  list: () => (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="mt-2 h-3 w-1/2" /></div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  ),
  // An admin screen: title, a pill search bar and table rows.
  admin: () => (
    <div className="p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-56" />
      <div className="mt-8 flex gap-3"><Skeleton className="h-11 w-64" /><Skeleton className="h-11 w-24" /></div>
      <div className="mt-5 overflow-hidden rounded-[22px] border border-line bg-white">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="border-b border-line px-4 py-4 last:border-0"><Skeleton className="h-5 w-full" /></div>)}
      </div>
    </div>
  ),
  // The brand mark, pulsing: for the instant a sign-in check runs, before any page shape is known.
  logo: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <img src="/logo/qvfits-icon.svg" alt="" width="44" height="26" className="h-auto w-11 animate-pulse" />
    </div>
  ),
};

/**
 * Holds the page's place while data or a lazy chunk loads, as grey shimmering
 * blocks shaped like the screen coming (not a spinner), so the footer does not
 * jump and the eye already knows the layout. `variant` picks the shape.
 */
export default function PageLoader({ variant = "page", className }) {
  const Shape = SHAPES[variant] ?? SHAPES.page;
  return (
    <div role="status" aria-label="Loading" aria-busy="true" className={className}>
      <Shape />
    </div>
  );
}
