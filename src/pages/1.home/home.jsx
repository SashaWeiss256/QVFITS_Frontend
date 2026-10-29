/* Home Page (from Quivogue index.html) */
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Campaign from "./sections/Campaign";
import Feed from "./sections/Feed";
import Hero from "./sections/Hero";
import Movements from "./sections/Movements";
import ProductRail from "./sections/ProductRail";
import Craft from "./sections/Craft";
import Reviews from "../4.about/sections/Reviews";
import Showroom from "../4.about/sections/Showroom";

// Top to bottom: the full-screen hero, what just landed, the movements as one
// band of pictures, the two ways the pieces are made, the campaign, the best
// sellers, the customers' own words, the invitation to a fitting, then the
// reels. The newsletter lives in the footer, once, so the page stays
// uncrowded. The rails fill themselves from products; the rest is the site's
// own content in src/data/home.json, with every link built from a target.
export default function HomePage() {
  useSeo();
  const { data: content } = useHomeContent();

  return (
    <>
      {/* Hero */}
      <Hero slides={content?.heroSlides} />
      {/* New releases */}
      <ProductRail rail={content?.rails.newReleases} kind="newReleases" />
      {/* Shop by movement */}
      <Movements movements={content?.movements} />
      {/* The craft: seamless and seam-fit */}
      <Craft />
      {/* Campaign */}
      <Campaign campaign={content?.campaign} />
      {/* Best sellers */}
      <ProductRail rail={content?.rails.bestSellers} kind="bestSellers" />
      {/* In their words */}
      <Reviews title="In their words" />
      {/* Book a fitting */}
      <Showroom />
      {/* Reels */}
      <Feed feed={content?.feed} />
    </>
  );
}
