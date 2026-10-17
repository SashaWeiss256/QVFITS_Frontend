/* Home Page (from Quivogue index.html) */
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Campaign from "./sections/Campaign";
import Feed from "./sections/Feed";
import Hero from "./sections/Hero";
import Movements from "./sections/Movements";
import Newsletter from "./sections/Newsletter";
import Press from "./sections/Press";
import ProductRail from "./sections/ProductRail";

// The original site's order, top to bottom. Every section reads the one
// home document the admin edits under Website, so nothing here is hardcoded.
export default function HomePage() {
  useSeo();
  const { data: content } = useHomeContent();

  return (
    <>
      <Hero slides={content?.heroSlides} />
      <Press press={content?.press} />
      <ProductRail rail={content?.rails.newReleases} kind="newReleases" />
      <ProductRail rail={content?.rails.bestSellers} kind="bestSellers" tight />
      <Movements movements={content?.movements} />
      <Campaign campaign={content?.campaign} />
      <Feed feed={content?.feed} />
      <Newsletter copy={content?.newsletter} />
    </>
  );
}
