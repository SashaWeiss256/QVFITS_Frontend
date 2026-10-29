/* Offer Sticker (from Quivogue initSticker()) */
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useLocale } from "@/i18n/LocaleProvider";
import { useOffers } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { readStored, writeStored } from "@/utils/storage";
import { t } from "@/i18n/translate";

/**
 * The small dismissible offer card. Shown only while the offer is live in
 * the admin, and only after BOTH the delay and a scroll, so it never drops
 * over the hero's Shop now button. Closing it is remembered for snoozeDays, across reloads and visits.
 * Its link scrolls to the newsletter form in the footer, on any page.
 */
export default function Sticker() {
  const { data: offers } = useOffers();
  const { welcomed } = useLocale();
  const s = offers?.sticker;
  const key = `qvfits:sticker:${s?.tag ?? "offer"}`;
  const [shown, setShown] = useState(false);
  // Closed for snoozeDays (saved), or for this visit at least if storage is blocked. Read against the
  // current key on every render: the offer arrives after the first paint, so a key read once at
  // mount would be the placeholder one and the saved "closed" would never be found.
  const [closedNow, setClosedNow] = useState(null);
  const [now] = useState(() => Date.now());
  const sessionClosed = (() => { try { return window.sessionStorage?.getItem(key) === "1"; } catch { return false; } })();
  const closed = closedNow === key || sessionClosed || now < Number(readStored(key, 0));
  const { pathname } = useLocation();
  // Never over the bag or checkout, where it only gets in the way; on a phone,
  // not on a product page either, where the add-to-bag bar holds the foot of the screen.
  const quiet = /^\/(cart|checkout|order|track-order)/.test(pathname);
  const product = pathname.startsWith("/product/");
  const live = Boolean(s?.live) && !closed && !quiet && welcomed;

  useEffect(() => {
    if (!live) return undefined;
    let waited = false;
    let moved = window.scrollY > 400;
    const show = () => waited && moved && setShown(true);
    const onScroll = () => {
      if (window.scrollY > 400) {
        moved = true;
        show();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => {
      waited = true;
      show();
    }, Number(s.delayMs) || 6000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [live, s]);

  if (!live) return null;

  // Closing takes effect at once: the scroll listener is removed with it, so a scroll can't bring the card back.
  const dismiss = () => {
    writeStored(key, Date.now() + (Number(s.snoozeDays) || 14) * 864e5);
    try { window.sessionStorage.setItem(key, "1"); } catch { /* storage blocked: the state alone holds */ }
    setShown(false);
    setClosedNow(key);
  };

  const go = () => {
    dismiss();
    const form = document.getElementById("newsForm");
    form?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => form?.querySelector("input")?.focus({ preventScroll: true }), 900);
  };

  return (
    <aside
      className={cn(
        // A phone gets a slim card beside Vee's round button (48px plus its gutters), a tablet or laptop the full one.
        "fixed bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--addbar,0px))] left-4 z-[60] w-[calc(100vw-6rem)] max-w-[320px] bg-cream py-3.5 pl-4 pr-11 text-ink shadow-sh-4 transition-all duration-700 ease-q",
        "sm:bottom-[calc(1.25rem+var(--addbar,0px))] sm:left-5 sm:w-[320px] sm:p-7 sm:pr-10 lg:bottom-5",
        product && "max-sm:hidden",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-label={s.title}
      aria-hidden={!shown}
    >
      {/* Close */}
      <button type="button" className="absolute right-2 top-2 grid h-10 w-10 place-items-center text-ink-3 hover:text-ink" aria-label={t("Close this offer")} onClick={dismiss} tabIndex={shown ? 0 : -1}>
        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
      {/* Offer */}
      <span className="text-[0.82rem] text-brand-600 max-sm:hidden">{s.tag}</span>
      <p className="font-display text-[1.05rem] leading-tight sm:mt-2 sm:text-[1.6rem]">{s.title}</p>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-2 max-sm:hidden">{s.text}</p>
      <button type="button" className="link-arrow inline-flex items-center gap-2 text-[0.85rem] font-medium sm:mt-5 sm:text-[0.9rem]" onClick={go} tabIndex={shown ? 0 : -1}>
        {s.cta} <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </aside>
  );
}
