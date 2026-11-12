/* Accordion (from Quivogue initAccordions()) */
import { useId, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/utils/cn";

/** `items` = [{ title, body }]. Used by the FAQ and the size guide. */
export default function Accordion({ items, defaultOpen = -1 }) {
  return (
    <div className="border-t border-line">
      {items.map((item, i) => (
        <AccordionItem key={item.title} title={item.title} startOpen={i === defaultOpen}>{item.body}</AccordionItem>
      ))}
    </div>
  );
}

function AccordionItem({ title, startOpen, children }) {
  const [open, setOpen] = useState(startOpen);
  // Measured on click, so the panel animates to its real height; an item
  // open from the start has no height cap at all.
  const [height, setHeight] = useState(startOpen ? "none" : 0);
  const panel = useRef(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setHeight(next ? panel.current.scrollHeight : 0);
  };
  const id = useId();

  return (
    <div className="border-b border-line">
      {/* Question */}
      <button type="button" className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug transition-colors hover:text-brand-600" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {title}
        <Plus className={cn("h-4 w-4 shrink-0 transition-transform duration-500 ease-q", open && "rotate-45")} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {/* Answer */}
      <div id={id} ref={panel} className="overflow-hidden transition-[max-height] duration-500 ease-q" style={{ maxHeight: height }}>
        <div className="max-w-[62ch] pb-6 text-[0.98rem] leading-[1.75] text-ink-2 [&_p+p]:mt-3">{children}</div>
      </div>
    </div>
  );
}
