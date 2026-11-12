/* Home Page (from Quivogue index.html) */
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Feed from "./sections/Feed";
import Hero from "./sections/Hero";
import Movements from "./sections/Movements";
import ProductRail from "./sections/ProductRail";
import Reviews from "../4.about/sections/Reviews";

// Top to bottom: the full-screen hero, what just landed, the best sellers,
// the sales, shop by movement, the videos, then a lean line of the customers' own words just above
// the footer. Nothing else: the craft lives on the product page, the fitting on
// About, the reels on /seen-on-you and the newsletter in the footer. The
// rails fill themselves from products; the rest is the site's own content in
// src/data/home.json, with every link built from a target.
export default function HomePage() {
  useSeo();
  const { data: content } = useHomeContent();

  return (
    <>
      {/* Hero */}
      <Hero slides={content?.heroSlides} />
      {/* New releases */}
      <ProductRail rail={content?.rails.newReleases} kind="newReleases" />
      {/* Best sellers */}
      <ProductRail rail={content?.rails.bestSellers} kind="bestSellers" />
      {/* Sales: pieces with a live discount, each with its % badge */}
      <ProductRail kind="sale" />
      {/* Shop by movement */}
      <Movements movements={content?.movements} />
      {/* Seen on you: the videos */}
      <Feed feed={content?.feed} />
      {/* In their words, close to the footer */}
      <Reviews title="In their words" lean />
    </>
  );
}
