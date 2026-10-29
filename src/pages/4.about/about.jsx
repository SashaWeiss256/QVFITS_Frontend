/* About Page */
import { PAGES } from "@/seo/shared";
import { useSeo } from "@/seo/useSeo";
import Reviews from "./sections/Reviews";
import Showroom from "./sections/Showroom";
import Story from "./sections/Story";

export default function AboutPage() {
  useSeo(PAGES.about);
  return (
    <>
      {/* The story: opening, the name, the chapters */}
      <Story />
      {/* In their words */}
      <Reviews title="In their words" />
      {/* The showroom: book a fitting */}
      <Showroom />
    </>
  );
}
