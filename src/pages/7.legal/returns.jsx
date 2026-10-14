/* Exchanges And Returns Page */
import { returns } from "./content/returns";
import LegalDocument from "./sections/LegalDocument";

export default function ReturnsPage() {
  return <LegalDocument path="/returns" build={returns} />;
}
