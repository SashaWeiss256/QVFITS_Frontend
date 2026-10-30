/* About Page */
import { PAGES } from "@/seo/shared";
import { useSeo } from "@/seo/useSeo";
import Showroom from "./sections/Showroom";
import Story from "./sections/Story";

export default function AboutPage() {
  useSeo(PAGES.about);
  return (
    <>
      {/* The story: opening, the statement, three principles */}
      <Story />
      {/* The showroom: book a fitting */}
      <Showroom />
    </>
  );
}
