/* Footer */
import { Link } from "react-router-dom";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useFacets, useNavigation, usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";
import { openCookieSettings } from "@/store/consent/consent";
import { whatsappLink } from "@/utils/whatsapp";
import NewsletterForm from "@/components/storefront/NewsletterForm";
import Logo from "./navbar/Logo";

export default function Footer() {
  const { data: settings } = useSettings();
  const { data: facets } = useFacets();
  const { data: nav } = useNavigation();
  const { data: copy } = usePageCopy("footer");
  const { money } = useCurrency();
  const tokens = shopTokens(settings, money);

  return (
    <footer className="ftr">
      <div className="wrap">
        {/* The newsletter on every page, above the columns. */}
        <section className="ftr__news" aria-labelledby="ftr-news-title">
          <div>
            <h2 id="ftr-news-title" className="m-0 font-display text-[1.35rem] font-bold tracking-tight">{copy?.newsTitle}</h2>
            <p className="m-0 mt-1 text-[.92rem] text-ink-3">{copy?.newsText}</p>
          </div>
          <NewsletterForm source="footer" cta={copy?.newsCta} />
        </section>
        <div className="ftr__grid">
          {/* Brand */}
          <div className="ftr__brand">
            <Logo size="lg" className="mb-[14px]" />
            {settings && (
              <p className="max-w-[34ch] text-[.9rem] text-ink-3">{settings.blurb} {copy?.blurbSuffix}</p>
            )}
          </div>

          {/* Shop */}
          <div>
            <h2 className="ftr__title">Shop</h2>
            <ul>
              {facets?.categoryList.map((c) => (
                <li key={c.id}><Link to={`/shop/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h2 className="ftr__title">Help</h2>
            <ul>
              {nav?.help.map((l) => <li key={l.href}><Link to={l.href}>{l.title}</Link></li>)}
            </ul>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="ftr__title">Legal</h2>
            <ul>
              {nav?.legal.map((l) => <li key={l.href}><Link to={l.href}>{l.title}</Link></li>)}
              <li><button type="button" className="ftr__cookie" onClick={openCookieSettings}>Cookie settings</button></li>
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
          <span>{fill(copy?.copyright, tokens)}</span>
          <span>{copy?.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
