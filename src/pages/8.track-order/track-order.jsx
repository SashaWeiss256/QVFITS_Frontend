/* Track Order Page */
import PageIntro from "@/components/layout/PageIntro";
import TrackOrderForm from "./sections/TrackOrderForm";

export default function TrackOrderPage() {
  return (
    <PageIntro kicker="Orders" title="Track an order" lede="Enter your order reference and the phone number you ordered with.">
      <TrackOrderForm />
    </PageIntro>
  );
}
