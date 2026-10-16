/* What People Say */
import Reveal from "@/components/ui/Reveal";
import { useReviews } from "@/store/tanstackStore/queries/site";

// Real quotes only, as the shop published them. Stars, date and badge show
// only when they exist; nothing is filled in with a guess.
export default function Reviews() {
  const { data: reviews = [] } = useReviews();
  if (!reviews.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">In their words</span>
          <h2>What people say</h2>
        </Reveal>
        <div className="grid-reviews">
          {reviews.map((r) => {
            const meta = [r.badge, r.when].filter(Boolean).join(" · ");
            return (
              <Reveal as="blockquote" key={r.name} className="review">
                {r.stars && <span className="stars" aria-label={`${r.stars} out of 5 stars`}>{"★".repeat(r.stars)}</span>}
                <p className="review__text">“{r.text}”</p>
                <div className="review__who">
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
