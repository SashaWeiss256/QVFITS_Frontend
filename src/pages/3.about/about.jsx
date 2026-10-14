/* About Page (port of Quivogue about.html) */
import { useSeo } from "@/seo/useSeo";
import AboutStory from "./sections/AboutStory";
import Reviews from "./sections/Reviews";
import Showroom from "./sections/Showroom";
import Values from "./sections/Values";

export default function AboutPage() {
  useSeo({ title: "About", description: "QV FITS makes premium seamless and seam-fit activewear, swim and lounge wear, from a showroom at THE CUBE, Kisementi, Kampala." });
  return (
    <>
      <AboutStory />
      <Values />
      <Reviews />
      <Showroom />
    </>
  );
}
