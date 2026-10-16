/* Track Order Page */
import PageIntro from "@/components/layout/PageIntro";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import LookupForm from "./sections/LookupForm";

export default function TrackOrderPage() {
  const { data: copy } = usePageCopy("trackOrder");
  return (
    <PageIntro kicker={copy?.kicker} title={copy?.title} lede={copy?.lede}>
      {/* Lookup stays isolated so the form can own its validation and result state. */}
      <LookupForm />
    </PageIntro>
  );
}
