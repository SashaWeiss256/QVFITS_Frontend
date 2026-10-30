/* In Their Words */
import { useEffect, useState } from "react";

import { usePageCopy, useReviews } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

/**
 * The customers' own words, exactly as they sent them, one at a time: the
 * quote set large in the serif, the names beneath as a quiet selector. It
 * moves on by itself every 8 seconds unless the visitor has picked a name or
 * prefers reduced motion. No placeholder quotes: the section disappears until
 * there are real ones. Used on the About page; the home page uses the lean
 * version, three short cards in a row.
 */
export default function Reviews({ title, lean = false }) {
  const { data: reviews = [] } = useReviews();
  const { data: copy } = usePageCopy("about");
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const list = reviews.slice(0, 6);

  // Turn the page on its own, gently, until someone chooses.
  useEffect(() => {
    if (held || list.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setAt((i) => (i + 1) % list.length), 8000);
    return () => clearInterval(t);
  }, [held, list.length]);

  if (!list.length) return null;

  // Lean: the first three words side by side as quiet cards, nothing moving. Used on the home page.
  if (lean) {
    return (
      <section className="section--tight bg-beige/60" aria-label={title ?? copy?.reviews.title}>
        <div className="wrap">
          <h2 className="mb-8 text-[clamp(1.35rem,2vw,1.8rem)] sm:text-center">{title ?? copy?.reviews.title}</h2>
          <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3 lg:gap-6">
            {list.slice(0, 3).map((q) => (
              <li key={q.id} className="flex flex-col justify-between gap-6 border border-line bg-cream/70 p-6 lg:p-7">
                <blockquote className="font-serif text-[1.05rem] italic leading-relaxed text-ink">
                  <span className="mb-1 block text-[1.6rem] leading-none text-ink-4" aria-hidden="true">&ldquo;</span>
                  {q.text}
                </blockquote>
                <p className="text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ink">{q.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const r = list[at];

  return (
    <section className="section bg-beige/60" aria-roledescription="carousel" aria-label={title ?? copy?.reviews.title}>
      <div className="wrap grid gap-12 lg:grid-cols-12">
        {/* Heading */}
        <div className="lg:col-span-3">
          <h2 className={"text-[clamp(1.6rem,2.4vw,2.2rem)]"}>{title ?? copy?.reviews.title}</h2>
        </div>

        {/* The quote */}
        <figure className="lg:col-span-8 lg:col-start-5">
          <blockquote key={r.id} className="min-h-[4.8em] animate-fade-up font-serif text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.25] text-ink" aria-live="polite">
            <span className="text-brand-600">“</span>{r.text}<span className="text-brand-600">”</span>
          </blockquote>
          {r.stars ? <p className="sr-only">{r.stars} out of 5 stars</p> : null}

          {/* Names: choose a voice */}
          <figcaption className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
            {list.map((q, i) => (
              <button
                key={q.id}
                type="button"
                aria-pressed={i === at}
                onClick={() => {
                  setAt(i);
                  setHeld(true);
                }}
                className={cn(
                  "relative py-1 text-[0.95rem] transition-colors",
                  i === at ? "text-ink after:absolute after:inset-x-0 after:-top-[25px] after:h-px after:bg-ink" : "text-ink-4 hover:text-ink",
                )}
              >
                {q.name}
              </button>
            ))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
