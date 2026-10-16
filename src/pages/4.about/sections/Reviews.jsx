/* What People Say */
import Reveal from "@/components/motion/Reveal";
import { usePageCopy, useReviews } from "@/store/tanstackStore/queries/site";

// Real quotes only, as the shop published them. Stars, date and badge show
// only when they exist; nothing is filled in with a guess.
export default function Reviews() {
  const { data: reviews = [] } = useReviews();
  const { data: copy } = usePageCopy("about");
  // No placeholder quotes: the section disappears until there are real ones.
  if (!reviews.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{copy?.reviews.kicker}</span>
          <h2>{copy?.reviews.title}</h2>
        </Reveal>
        <div className="grid-reviews">
          {reviews.map((r) => {
            // Join only the details this review actually has.
            const meta = [r.badge].filter(Boolean).join(" · ");
            return (
              <Reveal as="blockquote" key={r.id} className="review">
                {r.stars && <span className="stars" aria-label={`${r.stars} out of 5 stars`}>{"★".repeat(r.stars)}</span>}
                <p className="review__text">“{r.text}”</p>
                <div className="review__who">
                  {/* An initial stands in for a photo; reviews carry none. */}
                  <span className="review__av" aria-hidden="true">{r.name[0]}</span>
                  <div><strong>{r.name}</strong>{meta && <span>{meta}</span>}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
