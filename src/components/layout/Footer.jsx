/* Footer */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { cn } from "@/utils/cn";
import { usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { openCookieSettings } from "@/store/consent/consent";
import { whatsappLink } from "@/utils/whatsapp";
import CurrencyPicker from "@/components/storefront/CurrencyPicker";
import LanguagePicker from "@/components/storefront/LanguagePicker";
import NewsletterForm from "@/components/storefront/NewsletterForm";
import Logo from "./navbar/Logo";
import { t } from "@/i18n/translate";

const LINK = "inline-flex min-h-11 items-center text-[0.95rem] text-ink-3 transition-colors duration-300 hover:text-brand-600";
const TITLE = "mb-6 font-display text-[1.15rem] text-ink";

/**
 * The close of every page, on warm sand and kept quiet: four short columns
 * (the client's lobby, about, styles and products, and a small newsletter
 * sign-up) and a thin bar with the logo, copyright, social links and the
 * language and currency. Delivery, exchange and payment terms live in the
 * policies, not here. Every fact (phone, address) comes from Settings.
 */
export default function Footer() {
  const { data: s } = useSettings();
  const { data: copy } = usePageCopy("footer");
  const { money } = useCurrency();
  const tokens = shopTokens(s, money);

  return (
    <footer className="overflow-hidden border-t border-line bg-sand-100 text-ink">
      <div className="wrap">
        {/* Columns: four side by side on a laptop; on a phone, four rows that fold open */}
        <div className="py-8 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 md:py-14 lg:grid-cols-4 lg:gap-10">
          {/* Client's lobby: the ways to settle up and reach a person */}
          <FooterGroup title={t("Client's lobby")} nav>
            <li><Link className={LINK} to="/terms#payment">{t("Payment")}</Link></li>
            <li><Link className={LINK} to="/about#showroom">{t("Showroom")}</Link></li>
            <li><Link className={LINK} to="/contact">{t("Contact us")}</Link></li>
            <li><Link className={LINK} to="/contact#faq">{t("FAQs")}</Link></li>
            <li><Link className={LINK} to="/track-order">{t("Track an order")}</Link></li>
          </FooterGroup>

          {/* About: the house and its policies */}
          <FooterGroup title={t("About")} nav>
            <li><Link className={LINK} to="/about">{t("Our story")}</Link></li>
            <li><Link className={LINK} to="/delivery">{t("Delivery")}</Link></li>
            <li><Link className={LINK} to="/returns">{t("Returns and exchanges")}</Link></li>
            <li><Link className={LINK} to="/terms">{t("Terms of sale")}</Link></li>
            <li><Link className={LINK} to="/privacy">{t("Privacy policy")}</Link></li>
            <li><button type="button" className={LINK} onClick={openCookieSettings}>{t("Cookie settings")}</button></li>
          </FooterGroup>

          {/* Styles and products */}
          <FooterGroup title={t("Styles and products")} nav>
            <li><Link className={LINK} to="/size-guide">{t("Style and size guide")}</Link></li>
            <li><Link className={LINK} to="/shop">{t("Product portfolio")}</Link></li>
            <li><Link className={LINK} to="/seen-on-you">{t("Seen on you")}</Link></li>
          </FooterGroup>

          {/* Newsletter: small and simple */}
          <div className="max-md:border-b max-md:border-line-2 max-md:py-6 md:max-lg:col-span-2">
            <h2 className={cn(TITLE, "max-md:mb-3")}>{t("Newsletter")}</h2>
            {copy?.newsText && <p className="mb-4 max-w-xs text-[0.9rem] leading-relaxed text-ink-3">{copy.newsText}</p>}
            <NewsletterForm source="footer" cta={copy?.newsCta} formId="newsForm" />
          </div>
        </div>
      </div>

      {/* Bottom bar: copyright, social, currency. On a phone the social and settings row comes first, the
          copyright under it, and room is left at the foot for the floating Ask Vee button. */}
      <div className="wrap mt-7 flex flex-col gap-3 border-t border-line-2 pb-24 pt-5 text-[0.82rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-7 sm:pr-36 lg:pr-40">
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
    <Tag aria-label={nav ? title : undefined} className="max-md:border-b max-md:border-line-2 max-md:first:border-t">
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
