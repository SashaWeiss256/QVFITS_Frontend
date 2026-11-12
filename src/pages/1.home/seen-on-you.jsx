/* Seen On You */
import { PAGES } from "@/seo/shared";
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Feed from "./sections/Feed";

// The brand's reels, off the home page and one link away in the footer.
export default function SeenOnYouPage() {
  useSeo(PAGES.seenOnYou);
  const { data: content } = useHomeContent();
  return <Feed feed={content?.feed} />;
}
