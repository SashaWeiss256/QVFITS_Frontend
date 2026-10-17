/* Our Story */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/motion/Reveal";
import { useHomeContent, usePageCopy } from "@/store/tanstackStore/queries/site";

// The page's h1 lives here. Words from the admin's Pages module; the studio
// photo is the same one the home page uses.
export default function Story() {
  const { data: content } = useHomeContent();
  const { data: copy } = usePageCopy("about");
  // The words come from the page copy (src/data/pages.json); the photo from the home content.
  const story = copy?.story;

  return (
    <section className="section">
      <div className="wrap">
        {/* Breadcrumb */}
        <p className="crumbs"><Link to="/">Home</Link> / About</p>
        {/* Story And Studio Photo: side by side on a laptop, stacked on a phone */}
        <div className="about-grid">
          <Reveal>
            {story && (
              <>
                <span className="kicker">{story.kicker}</span>
                <h1>{story.title}</h1>
                {story.paragraphs.map((p) => <p key={p.slice(0, 24)} className="lede">{p}</p>)}
                <div className="mt-[26px] flex flex-wrap gap-3">
                  <Link className="btn btn--primary" to={story.primaryCta.href}>{story.primaryCta.label}</Link>
                  <Link className="btn btn--ghost" to={story.secondaryCta.href}>{story.secondaryCta.label}</Link>
                </div>
              </>
            )}
          </Reveal>
          {/* The studio photo */}
          <Reveal className="about-art">
            <Photo photo={content?.aboutPhoto} label="Inside the QVFITS studio" wide />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
