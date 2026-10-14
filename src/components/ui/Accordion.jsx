/* Accordion (from Quivogue initAccordions()) */
import { useId, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/utils/cn";

/** `items` = [{ title, body }]. Used by the FAQ and the size guide. */
export default function Accordion({ items, defaultOpen = -1 }) {
  return (
    <div className="acc">
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
    <div className={cn("acc__item", open && "is-open")}>
      <button type="button" className="acc__btn" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {title}
        <Plus className="h-[15px] w-[15px]" aria-hidden="true" />
      </button>
      <div id={id} ref={panel} className="acc__panel" style={{ maxHeight: height }}>
        <div>{children}</div>
      </div>
    </div>
  );
}
