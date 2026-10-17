/* Setup Checklist */
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/utils/cn";

// The three things a product needs to exist first, in the order they are done.
const STEPS = [
  { key: "categories", label: "Categories", hint: "What each piece is: Sets, Bras, Swim. Add the Shop by groups and their items too.", to: "/admin/categories" },
  { key: "colours", label: "Colours", hint: "The colours pieces come in, each with its swatch.", to: "/admin/categories?tab=colours" },
  { key: "sizes", label: "Sizes", hint: "The sizes pieces are made in, and the size chart.", to: "/admin/size-guide?tab=sizes" },
];

/**
 * Shown on Products until the catalogue is ready: a product needs a
 * category to sit in, and colours and sizes to be made in. The shop's
 * service refuses a new product until all three exist.
 */
export default function SetupChecklist({ counts }) {
  {/* Set Up The Catalogue First: shown on Products until the three steps are done */}
  return (
    <section className="mb-6 rounded-r-lg border border-brand-100 bg-brand-50/60 p-5 sm:p-6" aria-labelledby="setup-title">
      <h2 id="setup-title" className="m-0 text-[1.05rem] font-bold tracking-tight">Set up the catalogue first</h2>
      <p className="m-0 mt-1 text-sm text-ink-3">Then every product you add has what it needs, ready to pick.</p>
      {/* Steps: each a link to where it is done, ticked once it has something */}
      <ol className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const done = counts[s.key] > 0;
          return (
            <li key={s.key}>
              <Link to={s.to} className="group flex h-full gap-3 rounded-r-md border border-line bg-white p-4 transition-[border-color,box-shadow] duration-200 hover:border-brand-200 hover:shadow-sh-1">
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-[.78rem] font-bold", done ? "bg-success/15 text-success" : "bg-[image:var(--brand-grad)] text-white")}>
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="flex items-center gap-1.5 text-sm">
                    {s.label}
                    <span className="font-normal text-ink-4">{done ? `${counts[s.key]} set up` : "Not yet"}</span>
                  </strong>
                  <span className="mt-0.5 block text-[.8rem] text-ink-3">{s.hint}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
