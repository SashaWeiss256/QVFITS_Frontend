/* Home Page (from Quivogue index.html) */
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Campaign from "./sections/Campaign";
import Feed from "./sections/Feed";
import Hero from "./sections/Hero";
import Movements from "./sections/Movements";
import Newsletter from "./sections/Newsletter";
import ProductRail from "./sections/ProductRail";

// The original site's order, top to bottom. The two product rails fill
// themselves from products (New arrival, best sellers); the rest is the
// site's own content in src/data/home.json, with every link built from a
// target, never typed.
export default function HomePage() {
  useSeo();
  const { data: content } = useHomeContent();

  return (
    <>
      <Hero slides={content?.heroSlides} />
      <ProductRail rail={content?.rails.newReleases} kind="newReleases" />
      <ProductRail rail={content?.rails.bestSellers} kind="bestSellers" tight />
      <Movements movements={content?.movements} />
      <Campaign campaign={content?.campaign} />
      <Feed feed={content?.feed} />
      <Newsletter copy={content?.newsletter} />
    </>
  );
}
