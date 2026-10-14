/* Footer (from Quivogue buildChrome()) */
import { Link } from "react-router-dom";

import { useFacets, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

export default function Footer() {
  const { data: settings } = useSettings();
  const { data: facets } = useFacets();
  const year = new Date().getFullYear();

  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__grid">
          {/* Brand */}
          <div className="ftr__brand">
            <Link className="logo" to="/" aria-label="QV FITS home" style={{ marginBottom: 14 }}>
              <img src="/logo/qvfits-logo-horizontal.svg" alt="" width="173" height="48" className="logo__img logo__img--ftr" decoding="async" />
            </Link>
            {settings && (
              <p className="max-w-[34ch] text-[.9rem] text-ink-3">{settings.blurb} Made for the way you actually train.</p>
            )}
          </div>

          {/* Shop */}
          <div>
            <h2 className="ftr__title">Shop</h2>
            <ul>
              {facets?.categories.map((c) => (
                <li key={c}><Link to={`/shop?c=${encodeURIComponent(c)}`}>{c}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h2 className="ftr__title">Help</h2>
            <ul>
              <li><Link to="/size-guide">Size guide</Link></li>
              <li><Link to="/track-order">Track an order</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/account">Your account</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="ftr__title">Legal</h2>
            <ul>
              <li><Link to="/privacy">Privacy policy</Link></li>
              <li><Link to="/terms">Terms of sale</Link></li>
              <li><Link to="/returns">Exchanges &amp; returns</Link></li>
              <li><Link to="/delivery">Delivery</Link></li>
            </ul>
          </nav>

          {/* Visit */}
          {settings && (
            <div>
              <h2 className="ftr__title">Visit</h2>
              <ul>
                <li><a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">{settings.address}</a></li>
                {settings.addressNote && <li><span className="text-[.85rem] text-ink-4">{settings.addressNote}</span></li>}
                <li><span className="text-[.9rem] text-ink-3">Opens {settings.opensAt}</span></li>
                <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></li>
                <li><a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>
                <li><a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram {settings.instagramHandle}</a></li>
                {settings.tiktok && <li><a href={settings.tiktok} target="_blank" rel="noopener noreferrer">TikTok {settings.tiktokHandle}</a></li>}
              </ul>
            </div>
          )}
        </div>
        <div className="ftr__bot">
          <span>© {year} QV FITS. Kampala, Uganda.</span>
          <span>Seamless. Seam-fit. Swim. Lounge.</span>
        </div>
      </div>
    </footer>
  );
}
