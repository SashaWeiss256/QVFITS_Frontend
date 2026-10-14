/* Our Story */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/ui/Reveal";
import { useHomeContent } from "@/store/tanstackStore/queries/site";

export default function AboutStory() {
  const { data: content } = useHomeContent();

  return (
    <section className="section">
      <div className="wrap">
        <p className="crumbs"><Link to="/">Home</Link> / About</p>
        <div className="about-grid">
          <Reveal>
            <span className="kicker">Our story</span>
            <h1>Built for the way you actually train</h1>
            <p className="lede">
              QV FITS makes premium seamless and seam-fit activewear, swim and lounge wear, from a showroom at THE CUBE in Kisementi. Seamless where you want no seams to rub, seam-fit where you want structure: the construction is chosen per piece, not per season.
            </p>
            <p className="lede">
              We keep the range tight on purpose. Every piece is worn and tested before it goes in, which is why we can tell you honestly when something runs small, and why we would rather move you to a different piece than sell you the wrong size.
            </p>
            <div className="mt-[26px] flex flex-wrap gap-3">
              <Link className="btn btn--primary" to="/shop">Shop the range</Link>
              <Link className="btn btn--ghost" to="/contact">Come visit us</Link>
            </div>
          </Reveal>
          <Reveal className="about-art">
            <Photo photo={content?.aboutPhoto} label="Inside the QV FITS studio" wide />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
