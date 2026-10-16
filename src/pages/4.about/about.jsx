/* About Page (port of Quivogue about.html) */
import { useSeo } from "@/seo/useSeo";
import Story from "./sections/Story";
import Reviews from "./sections/Reviews";
import Showroom from "./sections/Showroom";
import Values from "./sections/Values";

export default function AboutPage() {
  useSeo({ title: "About", description: "QVFITS makes premium seamless and seam-fit activewear, swim and lounge wear, from a showroom at THE CUBE, Kisementi, Kampala." });
  return (
    <>
      {/* Keep the brand story ahead of proof points and the showroom visit details. */}
      <Story />
      <Values />
      <Reviews />
      <Showroom />
    </>
  );
}
