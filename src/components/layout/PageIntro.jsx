/* Page Intro */
import { useSeo } from "@/seo/useSeo";

/**
 * A page's one h1, in Quivogue's kicker / heading / lede pattern, and its tab
 * title. Every page has exactly one (the audit floor).
 */
export default function PageIntro({ kicker, title, lede, seoTitle, noindex, center = false, children }) {
  useSeo({ title: seoTitle ?? title, description: lede, noindex });
  return (
    <section className={`wrap section--tight ${center ? "center" : ""}`}>
      <div className="section-head">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1>{title}</h1>
        {lede && <p className="lede mt-4">{lede}</p>}
      </div>
      {children}
    </section>
  );
}
