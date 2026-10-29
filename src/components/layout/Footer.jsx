/* Footer */
import { useState } from "react";
import PaymentMark from "@/components/ui/PaymentMark";
import { Link } from "react-router-dom";
import { ChevronDown, Lock } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { cn } from "@/utils/cn";
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
                  <span className="block font-display text-[1rem] leading-snug text-ink transition-colors group-hover:text-brand-600 sm:text-[1.1rem]">{p.title}</span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-ink-3 sm:text-[0.85rem]">{p.text}</span>
                </>
              );
              const cls = "group block py-6 sm:py-8 lg:py-10";
              return (
                <li key={p.title} className={cn(i % 2 ? "pl-4 sm:pl-6 lg:pl-8" : i ? "lg:pl-8" : "", i < 2 && "max-lg:border-b max-lg:border-line-2")}>
                  {p.to ? <Link to={p.to} className={cls}>{inner}</Link> : <a href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>}
                </li>
              );
            })}
          </ul>
        )}

        {/* Newsletter: the invitation large, the form beside it */}
        <section className="grid gap-8 border-b border-line-2 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-24 lg:py-24" aria-labelledby="ftr-news-title">
          <div>
            <h2 id="ftr-news-title" className="max-w-xl text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.04] text-ink">{copy?.newsTitle}</h2>
            <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-ink-2">{copy?.newsText}</p>
          </div>
          <NewsletterForm source="footer" cta={copy?.newsCta} tone="light" formId="newsForm" />
        </section>

        {/* Columns: four side by side on a laptop; on a phone, four rows that fold open */}
        <div className="py-8 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:py-16 lg:grid-cols-4 lg:gap-10 lg:py-20">
          {/* Client services: real ways to reach a person */}
          {s && (
            <FooterGroup title={t("Client services")}>
              <li><a className={LINK} href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp {s.phone}</a></li>
              <li><a className={LINK} href={`tel:${s.phone.replace(/\s/g, "")}`}>{t("Call us")}</a></li>
              <li><a className={LINK} href={`mailto:${s.email}`}>{s.email}</a></li>
              <li><Link className={LINK} to="/contact">{t("Contact and questions")}</Link></li>
              <li><Link className={LINK} to="/track-order">{t("Track an order")}</Link></li>
            </FooterGroup>
          )}

          {/* The house */}
          <FooterGroup title={t("The house")} nav>
            <li><Link className={LINK} to="/about">{t("Our story")}</Link></li>
            <li><Link className={LINK} to="/size-guide">{t("Size guide")}</Link></li>
            {s && <li><a className={LINK} href={s.mapsUrl} target="_blank" rel="noopener noreferrer">{s.address}</a></li>}
          </FooterGroup>

          {/* Shop */}
          <FooterGroup title={t("Shop")} nav>
            {facets?.categoryList.map((c) => (
              <li key={c.id}><Link className={LINK} to={`/shop/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link className={LINK} to="/shop/kits">{t("Shop the kit")}</Link></li>
          </FooterGroup>

          {/* Policies */}
          <FooterGroup title={t("Policies")} nav>
            <li><Link className={LINK} to="/delivery">{t("Delivery")}</Link></li>
            <li><Link className={LINK} to="/returns">{t("Returns and exchanges")}</Link></li>
            <li><Link className={LINK} to="/terms">{t("Terms of sale")}</Link></li>
            <li><Link className={LINK} to="/privacy">{t("Privacy policy")}</Link></li>
            <li><button type="button" className={LINK} onClick={openCookieSettings}>{t("Cookie settings")}</button></li>
          </FooterGroup>
        </div>
      </div>

      {/* The name, and what it means: the one large gesture */}
      <div className="wrap border-t border-line-2 pt-10 sm:pt-12 lg:pt-16" aria-label="Quivogue: Qui for quality, Vogue for fashionable" role="img">
        <div aria-hidden="true"><FooterWordmark /></div>
      </div>

      {/* Payment: the ways to pay, as quiet marks (an even 2 by 2 on a phone), and a note on security */}
      {methods.length > 0 && (
        <div className="wrap mt-10 flex flex-col gap-4 border-t border-line-2 pt-7 sm:mt-12 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2" aria-label={t("Ways to pay")}>
            <span className="col-span-2 text-[0.82rem] text-ink-3 sm:mr-2">{t("Pay with")}</span>
            {methods.map((m) => (
              <PaymentMark key={m.id} method={m} className="max-sm:h-12 max-sm:w-full" />
            ))}
          </div>
          <p className="flex items-start gap-2 text-[0.82rem] text-ink-3 sm:items-center">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" strokeWidth={1.75} aria-hidden="true" />
            {t("Secure checkout. Mobile money and card payments are processed by Pesapal.")}
          </p>
        </div>
      )}

      {/* Bottom bar: copyright, social, currency. On a phone the social and settings row comes first, the
          copyright under it, and room is left at the foot for the floating Ask Vee button. */}
      <div className="wrap mt-7 flex flex-col gap-3 border-t border-line-2 pb-24 pt-5 text-[0.82rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-7">
        <div className="order-2 flex flex-col gap-4 sm:order-none sm:flex-row sm:items-center sm:gap-8">
          {/* The full colour logo, as the brand book shows it on a light ground; the header already carries it on a phone */}
          <Logo className="max-sm:hidden" />
          <span>{fill(copy?.copyright, tokens)}</span>
        </div>
        <div className="flex items-center justify-between gap-x-6 gap-y-2 sm:flex-wrap sm:justify-start">
          {/* Social: the shop's real accounts */}
          {s && (
            <ul className="-ml-2.5 flex gap-1 sm:ml-0" aria-label={t("Follow Quivogue")}>
              {s.instagram && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${s.instagramHandle ?? ""}`}><InstagramIcon className="h-[17px] w-[17px]" /></a></li>}
              {s.tiktok && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={s.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`TikTok ${s.tiktokHandle ?? ""}`}><TikTokIcon className="h-[17px] w-[17px]" /></a></li>}
              {s.whatsapp && <li><a className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-ink" href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={t("WhatsApp us")}><WhatsAppIcon className="h-[17px] w-[17px]" /></a></li>}
            </ul>
          )}
          <div className="flex items-center gap-4 text-ink-2 sm:gap-6"><LanguagePicker /><CurrencyPicker /></div>
        </div>
      </div>
    </footer>
  );
}

/**
 * One footer column. On a laptop or tablet it is a heading over its links; on a
 * phone the heading is a full-width row that folds the links open and shut, so
 * the four columns read as four tidy rows instead of a long stack.
 */
function FooterGroup({ title, nav = false, children }) {
  const [open, setOpen] = useState(false);
  const Tag = nav ? "nav" : "div";
  return (
    <Tag aria-label={nav ? title : undefined} className="border-b border-line-2 first:border-t md:border-0">
      <h2 className={cn(TITLE, "max-md:hidden")}>{title}</h2>
      <h2 className="md:hidden">
        <button type="button" className="flex min-h-14 w-full items-center justify-between text-left font-display text-[1.05rem] text-ink" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {title}
          <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform duration-300 ease-q", open && "rotate-180")} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </h2>
      <ul className={cn("space-y-0.5 max-md:pb-4", !open && "max-md:hidden")}>{children}</ul>
    </Tag>
  );
}
