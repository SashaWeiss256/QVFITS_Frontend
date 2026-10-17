/* Admin Page Header */
import { useContext } from "react";
import { createPortal } from "react-dom";

import { HeaderSlotContext } from "../lib/headerSlot";

// The page's h1 lives in the admin header. This adds the line on what the
// page is for, and puts the page's main action in the header beside View shop.
export default function PageHeader({ lede, action }) {
  const slot = useContext(HeaderSlotContext);
  return (
    <>
      {lede && <p className="m-0 mb-6 max-w-[65ch] text-[.95rem] leading-relaxed text-ink-3">{lede}</p>}
      {action && slot && createPortal(action, slot)}
    </>
  );
}
