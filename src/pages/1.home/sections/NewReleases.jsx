/* New Releases */
import { useRails } from "@/store/tanstackStore/queries/site";
import ProductRail from "./ProductRail";

export default function NewReleases() {
  const { data: rails } = useRails();
  return <ProductRail kicker="Just in" title="New releases" ids={rails?.newReleases} badge="New" cta="Shop the new" to="/shop?badge=New" />;
}
