/* Delivery Policy Page */
import { delivery } from "./content/delivery";
import LegalDocument from "./sections/LegalDocument";

export default function DeliveryPage() {
  return <LegalDocument path="/delivery" build={delivery} />;
}
