/* Menu Panel */
import { Link } from "react-router-dom";

import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useFacets, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";
import { NAV_ITEMS } from "./navbarMenu";

// The side menu: every nav link, then shop by category, then the shop's
// WhatsApp and Instagram. Reachable at every width from the menu button.
export default function MenuPanel() {
  const { data: facets } = useFacets();
  const { data: settings } = useSettings();
  const { customer } = useCustomerAuth();

  return (
    <>
      <div className="drawer__body">
        <nav className="drawer-menu" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className="drawer-menu__main">{item.title}</Link>
          ))}
          <Link to={customer ? "/account" : "/login"} className="drawer-menu__main">{customer ? "Your account" : "Sign in"}</Link>
        </nav>
        <p className="drawer-menu__label">Shop by category</p>
        <nav className="drawer-menu" aria-label="Categories">
          {facets?.categories.map((c) => (
            <Link key={c} to={`/shop?c=${encodeURIComponent(c)}`} className="drawer-menu__sub">{c}</Link>
          ))}
        </nav>
      </div>
      {settings && (
        <div className="drawer__foot">
          <a className="btn btn--primary btn--block" href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
          <a className="btn btn--ghost btn--block mt-2.5" href={settings.instagram} target="_blank" rel="noopener noreferrer">
            Instagram {settings.instagramHandle}
          </a>
          <p className="mt-3 text-center text-[.78rem] text-ink-4">{settings.address}</p>
        </div>
      )}
    </>
  );
}
