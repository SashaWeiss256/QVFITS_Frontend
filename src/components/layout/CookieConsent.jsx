/* Cookie Consent Banner */
import { useState } from "react";
import { Link } from "react-router-dom";

import { useLocale } from "@/i18n/LocaleProvider";
import { closeCookieSettings, saveConsent, useConsent } from "@/store/consent/consent";
import { t } from "@/i18n/translate";

// What the site may store, by purpose. Essential is always on; the other two stay off until the shopper agrees.
const PURPOSES = [
  { id: "essential", label: "Essential", text: "Your bag, saved pieces, sign-in and currency. The shop can't work without these.", locked: true },
  { id: "analytics", label: "Analytics", text: "Counting visits and popular pieces, so we know what to restock. Not in use yet; off until you say yes." },
  { id: "marketing", label: "Marketing", text: "Measuring our ads on Instagram and TikTok. Not in use yet; off until you say yes." },
];

/**
 * Shown on a first visit, and again from the footer's Cookie settings.
 * Accept all, Essential only, or Choose per purpose. Nothing beyond the
 * essentials runs until the shopper agrees (Uganda's Data Protection and
 * Privacy Act 2019).
 */
export default function CookieConsent() {
  const { consent, settingsOpen } = useConsent();
  // The banner shows on a first visit, and again when the footer's Cookie settings opens it.
  const { welcomed } = useLocale();
  const show = (!consent && welcomed) || settingsOpen;
  // Remounted on each opening (the key below), so the choices start from what was saved.
  return show ? <Banner key={settingsOpen ? "open" : "first"} consent={consent} startChoosing={settingsOpen} /> : null;
}

// Starts from what was saved, so changing a choice later begins from the old one.
function Banner({ consent, startChoosing }) {
  const [choosing, setChoosing] = useState(startChoosing);
  const [picked, setPicked] = useState({ analytics: Boolean(consent?.analytics), marketing: Boolean(consent?.marketing) });

  {/* Cookie Banner: a quiet card, not a modal, so the shop stays usable behind it */}
  return (
    <section
      data-lenis-prevent className="fixed inset-x-3 bottom-3 z-[80] max-h-[85vh] overflow-y-auto bg-ink p-5 sm:p-7 text-cream shadow-sh-4 animate-fade-up sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px] sm:p-8"
      role="dialog"
      aria-modal="false"
      aria-labelledby="consentTitle"
    >
      <h2 id="consentTitle" className="font-display text-[1.25rem] leading-tight text-cream sm:text-[1.5rem]">{t("Your privacy, your choice")}</h2>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-cream/70 sm:mt-3 sm:text-[0.9rem]">
        {t("We store a few things in your browser so the bag and sign-in work. Anything else waits for your yes.")}{" "}
        <Link to="/privacy#storage" className="text-cream underline underline-offset-4">{t("How we use your data")}</Link>
      </p>

      {/* Choices: one row per purpose */}
      {choosing && (
        <ul className="mt-6 border-t border-cream/15">
          {PURPOSES.map((p) => (
            <li key={p.id} className="border-b border-cream/15">
              <label className="flex cursor-pointer gap-4 py-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-brand-400"
                  checked={p.locked ? true : picked[p.id]}
                  disabled={p.locked}
                  onChange={(e) => setPicked({ ...picked, [p.id]: e.target.checked })}
                />
                <span>
                  <span className="block text-[0.92rem] font-medium">
                    {t(p.label)}
                    {p.locked && <span className="ml-2 font-normal text-cream/50">{t("Always on")}</span>}
                  </span>
                  <span className="mt-1 block text-[0.84rem] leading-relaxed text-cream/60">{t(p.text)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {/* Actions: Accept all or Save my choices, Essential only, and Choose (hidden once choosing) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 sm:mt-6">
        {choosing ? (
          <button type="button" className="btn btn--light" onClick={() => saveConsent(picked)}>{t("Save my choices")}</button>
        ) : (
          <button type="button" className="btn btn--light" onClick={() => saveConsent({ analytics: true, marketing: true })}>{t("Accept all")}</button>
        )}
        <button type="button" className="inline-flex min-h-11 items-center text-[0.88rem] text-cream/80 underline-offset-4 hover:text-cream hover:underline" onClick={() => saveConsent({})}>{t("Essential only")}</button>
        {!choosing && <button type="button" className="inline-flex min-h-11 items-center text-[0.88rem] text-cream/80 underline-offset-4 hover:text-cream hover:underline" onClick={() => setChoosing(true)}>{t("Choose")}</button>}
        {consent && <button type="button" className="text-[0.88rem] text-cream/60 hover:text-cream" onClick={closeCookieSettings}>{t("Close")}</button>}
      </div>
    </section>
  );
}
