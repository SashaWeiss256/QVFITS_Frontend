/* Privacy Policy Page */
import { privacy } from "./content/privacy";
import LegalDocument from "./sections/LegalDocument";

export default function PrivacyPage() {
  return <LegalDocument path="/privacy" build={privacy} />;
}
