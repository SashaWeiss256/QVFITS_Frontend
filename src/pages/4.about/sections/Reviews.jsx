/* In Their Words */
import { useEffect, useState } from "react";

import { usePageCopy, useReviews } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

/**
 * The customers' own words, exactly as they sent them, one at a time: the
 * quote set large in the serif, the names beneath as a quiet selector. It
 * moves on by itself every 8 seconds unless the visitor has picked a name or
 * prefers reduced motion. No placeholder quotes: the section disappears until
 * there are real ones. Used on the About page and the home page.
 */
export default function Reviews({ title }) {
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
  const r = list[at];

  return (
    <section className="section bg-beige/60" aria-roledescription="carousel" aria-label={title ?? copy?.reviews.title}>
      <div className="wrap grid gap-12 lg:grid-cols-12">
        {/* Heading */}
        <div className="lg:col-span-3">
          <h2 className="text-[clamp(1.6rem,2.4vw,2.2rem)]">{title ?? copy?.reviews.title}</h2>
        </div>

        {/* The quote */}
        <figure className="lg:col-span-8 lg:col-start-5">
          <blockquote key={r.id} className="min-h-[4.8em] animate-[promo-in_0.9s_var(--ease-q)] font-display text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.18] text-ink" aria-live="polite">
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
