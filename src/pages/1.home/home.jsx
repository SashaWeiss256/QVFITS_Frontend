/* Home Page (port of Quivogue index.html) */
import { useSeo } from "@/seo/useSeo";
import BestSellers from "./sections/BestSellers";
import Campaign from "./sections/Campaign";
import Hero from "./sections/Hero";
import Movements from "./sections/Movements";
import NewReleases from "./sections/NewReleases";
import Newsletter from "./sections/Newsletter";
import Press from "./sections/Press";
import ShopTheFeed from "./sections/ShopTheFeed";

// Quivogue's order, one section per file.
export default function HomePage() {
  useSeo();
  return (
    <>
      <Hero />
      <Press />
      <NewReleases />
      <BestSellers />
      <Movements />
      <Campaign />
      <ShopTheFeed />
      <Newsletter />
    </>
  );
}
