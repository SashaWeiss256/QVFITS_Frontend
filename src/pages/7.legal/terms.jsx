/* Terms Of Sale Page */
import { terms } from "./content/terms";
import LegalDocument from "./sections/LegalDocument";

export default function TermsPage() {
  return <LegalDocument path="/terms" build={terms} />;
}
