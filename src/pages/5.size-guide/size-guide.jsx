/* Size Guide Page (port of Quivogue size-guide.html) */
import { Link, useSearchParams } from "react-router-dom";

import { PAGES } from "@/seo/shared";
import { useSeo } from "@/seo/useSeo";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import BodyMap from "./sections/BodyMap";
import FitNotes from "./sections/FitNotes";
import Chart from "./sections/Chart";
import Finder from "./sections/Finder";
import { t } from "@/i18n/translate";

export default function SizeGuidePage() {
  useSeo(PAGES.sizeGuide);
  const [params] = useSearchParams();
  const { data: copy } = usePageCopy("sizeGuide");

  return (
    <>
      {/* Intro */}
      <section className="section section--tight">
        <div className="wrap">
          <p className="crumbs"><Link to="/">{t("Home")}</Link> / Size guide</p>
          <div className="section-head center">
            <span className="kicker">{copy?.kicker}</span>
            <h1>{copy?.title}</h1>
            <p className="lede">{copy?.lede}</p>
          </div>
        </div>
      </section>
      <section className="section section--tight">
        <div className="wrap">
          <div className="about-grid">
            {/* Product links can preselect a piece so its fit guidance is used. */}
            <Finder presetId={params.get("id") ?? undefined} />
            <BodyMap />
          </div>
        </div>
      </section>
      {/* The full numbers, then each piece's fit, for anyone who skips the finder. */}
      <Chart />
      <FitNotes />
    </>
  );
}
