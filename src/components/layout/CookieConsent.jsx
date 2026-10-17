/* Cookie Consent Banner */
import { useState } from "react";
import { Link } from "react-router-dom";

import { closeCookieSettings, saveConsent, useConsent } from "@/store/consent/consent";

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
  const show = !consent || settingsOpen;
  // Remounted on each opening (the key below), so the choices start from what was saved.
  return show ? <Banner key={settingsOpen ? "open" : "first"} consent={consent} startChoosing={settingsOpen} /> : null;
}

function Banner({ consent, startChoosing }) {
  const [choosing, setChoosing] = useState(startChoosing);
  const [picked, setPicked] = useState({ analytics: Boolean(consent?.analytics), marketing: Boolean(consent?.marketing) });

  return (
    <section className="consent" role="dialog" aria-modal="false" aria-labelledby="consentTitle">
      <h2 id="consentTitle" className="consent__title">Your privacy, your choice</h2>
      <p className="consent__text">
        We store a few things in your browser so the bag and sign-in work. Anything else waits for your yes. <Link to="/privacy#storage">How we use your data</Link>
      </p>

      {choosing && (
        <ul className="consent__list">
          {PURPOSES.map((p) => (
            <li key={p.id}>
              <label className="consent__row">
                <input
                  type="checkbox"
                  checked={p.locked ? true : picked[p.id]}
                  disabled={p.locked}
                  onChange={(e) => setPicked({ ...picked, [p.id]: e.target.checked })}
                />
                <span>
                  <strong>{p.label}{p.locked && <span className="consent__always"> Always on</span>}</strong>
                  <span className="consent__hint">{p.text}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="consent__actions">
        {choosing ? (
          <button type="button" className="btn btn--primary" onClick={() => saveConsent(picked)}>Save my choices</button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => saveConsent({ analytics: true, marketing: true })}>Accept all</button>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => saveConsent({})}>Essential only</button>
        {!choosing && <button type="button" className="btn btn--soft" onClick={() => setChoosing(true)}>Choose</button>}
        {consent && <button type="button" className="consent__close" onClick={closeCookieSettings}>Close</button>}
      </div>
    </section>
  );
}
