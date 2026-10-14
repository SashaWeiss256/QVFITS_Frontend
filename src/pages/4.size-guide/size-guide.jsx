/* Size Guide Page (port of Quivogue size-guide.html) */
import { Link, useSearchParams } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import BodyMap from "./sections/BodyMap";
import FitNotes from "./sections/FitNotes";
import SizeChart from "./sections/SizeChart";
import SizeFinder from "./sections/SizeFinder";

export default function SizeGuidePage() {
  useSeo({ title: "Size guide", description: "QV FITS size chart in cm and inches, a size finder, and how each piece fits." });
  const [params] = useSearchParams();

  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          <p className="crumbs"><Link to="/">Home</Link> / Size guide</p>
          <div className="section-head center">
            <span className="kicker">Get it right first time</span>
            <h1>Size guide</h1>
            <p className="lede">These are <strong>body</strong> measurements, not garment measurements. Measure yourself over your underwear, keep the tape snug but not tight, and breathe normally.</p>
          </div>
        </div>
      </section>
      <section className="section section--tight">
        <div className="wrap">
          <div className="about-grid">
            <SizeFinder presetId={params.get("id") ?? undefined} />
            <BodyMap />
          </div>
        </div>
      </section>
      <SizeChart />
      <FitNotes />
    </>
  );
}
