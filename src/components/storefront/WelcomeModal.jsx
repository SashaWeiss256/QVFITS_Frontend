/* Welcome Pop Up: language and currency, on a first visit */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check } from "lucide-react";

import { useLocale } from "@/i18n/LocaleProvider";
import { t } from "@/i18n/translate";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { photoSources } from "@/utils/media";

// The few currencies most visitors want sit in the open; the rest are one tap away.
const FEATURED = ["UGX", "USD", "EUR", "GBP", "KES"];
// A fixed sum shown in the chosen currency, so the choice is seen, not just named.
const SAMPLE = 250000;

/**
 * Asked once, on a first visit, a moment after the page has settled. A
 * campaign photograph on one side; on the other, the language (each in its
 * own script) and the display currency, with a live sample of a price in it.
 * Both can be changed later from the footer. Until it is answered the cookie
 * notice and the offer card wait, so a new visitor never meets three things at once.
 */
export default function WelcomeModal() {
  const { lang, languages, setLang, welcomed, finishWelcome } = useLocale();
  const { currency, currencies, setCurrency, money } = useCurrency();
  const { data: content } = useHomeContent();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (welcomed) return undefined;
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, [welcomed]);

  const open = ready && !welcomed;

  // The page behind stays still while the choice is made.
  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && finishWelcome();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, finishWelcome]);

  if (!open) return null;

  const featured = currencies.filter((c) => FEATURED.includes(c.code));
  const others = currencies.filter((c) => !FEATURED.includes(c.code));
  const photo = content?.heroSlides?.find((s) => s.photo)?.photo;
  const src = photo ? photoSources(photo, { wide: true }) : null;
  // Each block rises in turn, once.
  const rise = (n) => ({ animation: `promo-in 0.9s var(--ease-q) ${0.25 + n * 0.09}s both` });

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-8">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-[promo-in_0.8s_var(--ease-q)]" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcomeTitle"
        className="relative flex max-h-[96dvh] w-full max-w-[920px] flex-col overflow-hidden bg-cream text-ink shadow-sh-4 animate-[promo-in_0.9s_var(--ease-q)] md:min-h-[600px] md:flex-row"
      >
        {/* Photograph: slowly settling, the name across its foot */}
        <div className="relative h-36 shrink-0 overflow-hidden bg-ink md:h-auto md:w-[42%]" aria-hidden="true">
          {src ? (
            <img className="absolute inset-0 h-full w-full scale-110 object-cover object-[50%_22%] animate-[welcome-settle_9s_var(--ease-q)_forwards]" src={src.src} srcSet={src.srcSet} sizes="400px" alt="" />
          ) : (
            <div className="absolute inset-0 bg-[image:var(--brand-grad)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <p className="absolute inset-x-6 bottom-5 font-logo text-[1.9rem] uppercase leading-none tracking-[0.12em] text-cream md:bottom-8 md:left-8 md:text-[2.6rem]">QVFITS</p>
        </div>

        {/* Choices */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div data-lenis-prevent className="flex-1 overflow-y-auto px-7 pb-3 pt-7 md:px-12 md:pt-10">
            <div className="h-[2px] w-12 bg-[image:var(--brand-grad)]" style={rise(0)} aria-hidden="true" />
            <h2 id="welcomeTitle" className="mt-5 font-display text-[clamp(2rem,4.2vw,2.6rem)] font-bold leading-[1.02] tracking-[-0.02em]" style={rise(1)}>{t("Welcome to Quivogue")}</h2>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ink-3" style={rise(2)}>{t("Choose how you would like to shop. You can change both at any time from the footer.")}</p>

            {/* Language: one line each, in its own script */}
            <fieldset className="mt-7" style={rise(3)}>
              <legend className="text-[0.82rem] text-ink-3">{t("Language")}</legend>
              <div className="mt-2 grid grid-cols-2 gap-x-8" role="radiogroup">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={l.code === lang}
                    lang={l.code}
                    className={cn("group flex min-h-11 w-full items-center justify-between border-t border-line text-start text-[1.05rem] transition-colors", l.code === lang ? "text-ink" : "text-ink-3 hover:text-ink")}
                    onClick={() => setLang(l.code)}
                  >
                    <span className={cn("transition-transform duration-500 ease-q", l.code !== lang && "group-hover:translate-x-1 rtl:group-hover:-translate-x-1")}>{l.native}</span>
                    <span className={cn("grid h-5 w-5 place-items-center rounded-full bg-[image:var(--brand-grad)] text-cream transition-all duration-500 ease-q", l.code === lang ? "scale-100 opacity-100" : "scale-50 opacity-0")}>
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Currency: the usual five, the rest in a menu, then the sample */}
            {currencies.length > 1 && (
              <fieldset className="mt-6" style={rise(4)}>
                <legend className="text-[0.82rem] text-ink-3">{t("Currency")}</legend>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1" role="radiogroup">
                  {featured.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      role="radio"
                      aria-checked={c.code === currency.code}
                      title={t(c.label)}
                      className={cn("relative min-h-11 text-[0.95rem] tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-500 after:ease-q", c.code === currency.code ? "font-medium text-ink after:scale-x-100" : "text-ink-3 after:scale-x-0 hover:text-ink")}
                      onClick={() => setCurrency(c.code)}
                    >
                      {c.code}
                    </button>
                  ))}
                  {others.length > 0 && (
                    <select
                      aria-label={t("Currency")}
                      className={cn("min-h-11 w-16 cursor-pointer bg-transparent text-[0.95rem] outline-none", others.some((c) => c.code === currency.code) ? "font-medium text-ink" : "text-ink-3")}
                      value={others.some((c) => c.code === currency.code) ? currency.code : ""}
                      onChange={(e) => e.target.value && setCurrency(e.target.value)}
                    >
                      <option value="">{others.length}+</option>
                      {others.map((c) => <option key={c.code} value={c.code}>{c.code}, {t(c.label)}</option>)}
                    </select>
                  )}
                </div>
                <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3 text-[0.88rem] text-ink-3">
                  <span>{t(currency.label)}</span>
                  <span className="font-display text-[1.15rem] font-semibold text-ink">{money(SAMPLE)}</span>
                </p>
                <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-4">{t("Prices in other currencies are approximate and follow the day's exchange rates. Orders are always charged in Ugandan shillings (UGX).")}</p>
              </fieldset>
            )}
          </div>

          {/* Continue: always in view */}
          <div className="px-7 pb-7 pt-4 md:px-12 md:pb-8" style={rise(5)}>
            <button type="button" className="btn btn--primary btn--lg w-full justify-center" onClick={finishWelcome}>
              {t("Continue to the shop")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
