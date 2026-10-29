/* Footer */
import PaymentMark from "@/components/ui/PaymentMark";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useFacets, usePageCopy, usePaymentMethods, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { openCookieSettings } from "@/store/consent/consent";
import { whatsappLink } from "@/utils/whatsapp";
import CurrencyPicker from "@/components/storefront/CurrencyPicker";
import LanguagePicker from "@/components/storefront/LanguagePicker";
import NewsletterForm from "@/components/storefront/NewsletterForm";
import FooterWordmark from "./FooterWordmark";
import Logo from "./navbar/Logo";
import { t } from "@/i18n/translate";

const LINK = "inline-flex min-h-11 items-center text-[0.95rem] text-ink-3 transition-colors duration-300 hover:text-brand-600";
const TITLE = "mb-6 font-display text-[1.15rem] text-ink";

/**
 * The close of every page, on warm sand, with the brand gradient kept for the name. From the top:
 * the house's promises in one quiet row; the newsletter; four columns
 * (client services, the house, shop, policies); then the name itself, set
 * across the full width and annotated with what it means, Qui for quality
 * and Vogue for fashionable, as the client tells it. A thin bar ends it.
 * Every fact (fees, days, phone, address) comes from Settings.
 */
export default function Footer() {
  const { data: s } = useSettings();
  const { data: facets } = useFacets();
  const { data: copy } = usePageCopy("footer");
  const { data: methods = [] } = usePaymentMethods();
  const { money } = useCurrency();
  const tokens = shopTokens(s, money);

  // The promises, each only when Settings has the fact behind it.
  const promises = s
    ? [
        s.freeShippingOver && { title: "Complimentary delivery", text: `On orders over ${money(s.freeShippingOver)}`, to: "/delivery" },
        s.exchangeDays && { title: `${s.exchangeDays}-day exchanges`, text: "On unworn pieces, tags on", to: "/returns" },
        s.whatsapp && { title: "Personal styling", text: "On WhatsApp, every day", href: whatsappLink(s.whatsapp) },
        s.address && { title: "The showroom", text: `Kisementi, from ${s.opensAt}`, href: s.mapsUrl },
      ].filter(Boolean)
    : [];

  return (
    <footer className="overflow-hidden border-t border-line bg-sand-100 text-ink">
      <div className="wrap">
        {/* Promises: one quiet row */}
        {promises.length > 0 && (
          <ul className="grid grid-cols-2 border-b border-line-2 lg:grid-cols-4" aria-label={t("Our promises")}>
            {promises.map((p, i) => {
              const inner = (
                <>
                  <span className="block font-display text-[1.1rem] text-ink transition-colors group-hover:text-brand-600">{p.title}</span>
                  <span className="mt-1 block text-[0.85rem] text-ink-3">{p.text}</span>
                </>
              );
              const cls = "group block py-8 lg:py-10";
              return (
                <li key={p.title} className={i % 2 ? "pl-6 lg:pl-8" : i ? "lg:pl-8" : ""}>
                  {p.to ? <Link to={p.to} className={cls}>{inner}</Link> : <a href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>}
                </li>
              );
            })}
          </ul>
        )}

        {/* Newsletter: the invitation large, the form beside it */}
        <section className="grid gap-10 border-b border-line-2 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-24 lg:py-24" aria-labelledby="ftr-news-title">
          <div>
            <h2 id="ftr-news-title" className="max-w-xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.04] text-ink">{copy?.newsTitle}</h2>
            <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-ink-2">{copy?.newsText}</p>
          </div>
          <NewsletterForm source="footer" cta={copy?.newsCta} tone="light" formId="newsForm" />
        </section>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-4 lg:gap-10 lg:py-20">
          {/* Client services: real ways to reach a person */}
          {s && (
            <div className="col-span-2 sm:col-span-1">
              <h2 className={TITLE}>{t("Client services")}</h2>
              <ul className="space-y-0.5">
                <li><a className={LINK} href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp {s.phone}</a></li>
                <li><a className={LINK} href={`tel:${s.phone.replace(/\s/g, "")}`}>{t("Call us")}</a></li>
                <li><a className={LINK} href={`mailto:${s.email}`}>{s.email}</a></li>
                <li><Link className={LINK} to="/contact">{t("Contact and questions")}</Link></li>
                <li><Link className={LINK} to="/track-order">{t("Track an order")}</Link></li>
              </ul>
            </div>
          )}

          {/* The house */}
          <nav aria-label={t("The house")}>
            <h2 className={TITLE}>{t("The house")}</h2>
            <ul className="space-y-0.5">
              <li><Link className={LINK} to="/about">{t("Our story")}</Link></li>
              <li><Link className={LINK} to="/size-guide">{t("Size guide")}</Link></li>
              {s && <li><a className={LINK} href={s.mapsUrl} target="_blank" rel="noopener noreferrer">{s.address}</a></li>}
            </ul>
          </nav>

          {/* Shop */}
          <nav aria-label={t("Shop")}>
            <h2 className={TITLE}>{t("Shop")}</h2>
            <ul className="space-y-0.5">
              {facets?.categoryList.map((c) => (
                <li key={c.id}><Link className={LINK} to={`/shop/${c.slug}`}>{c.name}</Link></li>
              ))}
              <li><Link className={LINK} to="/shop/kits">{t("Shop the kit")}</Link></li>
            </ul>
          </nav>

          {/* Policies */}
          <nav aria-label={t("Policies")}>
            <h2 className={TITLE}>{t("Policies")}</h2>
            <ul className="space-y-0.5">
              <li><Link className={LINK} to="/delivery">{t("Delivery")}</Link></li>
              <li><Link className={LINK} to="/returns">{t("Returns and exchanges")}</Link></li>
              <li><Link className={LINK} to="/terms">{t("Terms of sale")}</Link></li>
              <li><Link className={LINK} to="/privacy">{t("Privacy policy")}</Link></li>
              <li><button type="button" className={LINK} onClick={openCookieSettings}>{t("Cookie settings")}</button></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* The name, and what it means: the one large gesture */}
      <div className="wrap border-t border-line-2 pt-12 lg:pt-16" aria-label="Quivogue: Qui for quality, Vogue for fashionable" role="img">
        <div aria-hidden="true"><FooterWordmark /></div>
      </div>

      {/* Payment: the ways to pay, as quiet marks, and a note on security */}
      {methods.length > 0 && (
        <div className="wrap mt-12 flex flex-col gap-4 border-t border-line-2 pt-7 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label={t("Ways to pay")}>
            <span className="mr-2 text-[0.82rem] text-ink-3">{t("Pay with")}</span>
            {methods.map((m) => (
              <PaymentMark key={m.id} method={m} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-[0.82rem] text-ink-3">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            {t("Secure checkout. Mobile money and card payments are processed by Pesapal.")}
          </p>
        </div>
      )}

      {/* Bottom bar: copyright, social, currency */}
      <div className="wrap mt-7 flex flex-col gap-5 border-t border-line-2 py-7 text-[0.82rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          {/* The full colour logo, as the brand book shows it on a light ground */}
          <Logo />
          <span>{fill(copy?.copyright, tokens)}</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Social: the shop's real accounts */}
          {s && (
            <ul className="flex gap-1" aria-label={t("Follow Quivogue")}>
              {s.instagram && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${s.instagramHandle ?? ""}`}><InstagramIcon className="h-[17px] w-[17px]" /></a></li>}
              {s.tiktok && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={s.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`TikTok ${s.tiktokHandle ?? ""}`}><TikTokIcon className="h-[17px] w-[17px]" /></a></li>}
              {s.whatsapp && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={t("WhatsApp us")}><WhatsAppIcon className="h-[17px] w-[17px]" /></a></li>}
            </ul>
          )}
          <div className="flex items-center gap-6 text-ink-2"><LanguagePicker /><CurrencyPicker /></div>
        </div>
      </div>
    </footer>
  );
}
