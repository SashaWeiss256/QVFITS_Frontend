/* Page Loader */

// Holds the page height while data or a lazy chunk loads, so the footer does
// not jump up and back down.
export default function PageLoader({ className = "min-h-[60vh]" }) {
  return (
    <div role="status" aria-label="Loading" className={`flex items-center justify-center ${className}`}>
      <img src="/logo/qvfits-icon.svg" alt="" width="44" height="26" className="h-auto w-11 animate-pulse" />
    </div>
  );
}
