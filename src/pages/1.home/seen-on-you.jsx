/* Seen On You */
import { useSeo } from "@/seo/useSeo";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import Feed from "./sections/Feed";

// The brand's reels, off the home page and one link away in the footer.
export default function SeenOnYouPage() {
  useSeo({ title: "Seen on you", description: "QVFITS pieces on the people who wear them, straight from our feed." });
  const { data: content } = useHomeContent();
  return <Feed feed={content?.feed} />;
}
