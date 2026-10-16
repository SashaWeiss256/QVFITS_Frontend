/* Order Confirmed Page */
import { useParams } from "react-router-dom";

import PageIntro from "@/components/layout/PageIntro";

// Shown after checkout with the order reference the shopper quotes.
export default function OrderConfirmedPage() {
  // The reference comes from the URL, so this page survives a refresh.
  const { ref } = useParams();
  return <PageIntro kicker="Thank you" title="Order received" noindex lede={`Your reference is ${ref}. We'll confirm on WhatsApp.`} center />;
}
