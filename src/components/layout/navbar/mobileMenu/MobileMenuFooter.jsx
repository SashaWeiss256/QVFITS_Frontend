/* Mobile Menu Footer */
import { Link } from "react-router-dom";

import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

// Account access and the shop's contact details.
export default function MobileMenuFooter() {
  const { data: s } = useSettings();
  const { customer } = useCustomerAuth();

  return (
    <div className="mmenu__foot">
      <div className="flex items-center justify-between gap-3">
        <Link to={customer ? "/account" : "/login"} className="link-arrow inline-flex min-h-11 items-center">{customer ? "Your account" : "Sign in"}</Link>
      </div>
      {/* Contact details come from settings; render nothing until they load. */}
      {s && (
        <>
          <a className="btn btn--primary btn--block" href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          <p className="m-0 text-center text-[.8rem] text-ink-4">{s.address}</p>
        </>
      )}
    </div>
  );
}
