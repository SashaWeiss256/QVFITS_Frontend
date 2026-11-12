/* Cart Layout */

// The bag and checkout pages: the list on the left, the summary on the right,
// held in view while the list scrolls. One column below 960px.
export default function CartLayout({ children }) {
  return (
    <div className="mt-2 grid gap-10 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(340px,410px)] min-[960px]:items-start min-[960px]:gap-[clamp(40px,6vw,88px)] min-[960px]:[&>:last-child]:sticky min-[960px]:[&>:last-child]:top-[104px]">
      {children}
    </div>
  );
}
