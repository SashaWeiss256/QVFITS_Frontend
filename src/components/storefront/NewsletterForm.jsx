/* Newsletter Form */
import { useState } from "react";
import { Link } from "react-router-dom";

import { demoEmailLink, useNewsletterConsent, useSubscribe } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Join the newsletter, from the footer, the home page or anywhere else. The
 * words agreed to sit under the button, and are stored with the address.
 * Double opt-in: the address is only on the list once the emailed link is
 * opened. Honest seam: until an email service is connected the email waits
 * in the admin's outbox; a dev build shows its link here to try the flow.
 */
export default function NewsletterForm({ source, placeholder = "Your email", cta = "Sign up", className, formId }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const subscribe = useSubscribe();
  const { data: consent } = useNewsletterConsent();

  const onSubmit = async (e) => {
    e.preventDefault();
    const clean = email.trim();
    if (!EMAIL.test(clean)) return setResult({ tone: "warn", text: "That email looks a little off. Mind checking it?" });
    try {
      const r = await subscribe.mutateAsync({ email: clean, source });
      setEmail("");
      setResult(
        r.status === "subscribed"
          ? { tone: "ok", text: "You're already on the list. See you at the next drop." }
          : { tone: "ok", text: "Almost there: check your inbox and tap the link to confirm.", demo: demoEmailLink(r.email, "newsletter-confirm") },
      );
    } catch (err) {
      setResult({ tone: "warn", text: err.message });
    }
  };

  return (
    <div className={className}>
      <form className="news__form" id={formId} noValidate onSubmit={onSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} aria-label="Email address" autoComplete="email" required />
        <button className="btn btn--primary" type="submit" disabled={subscribe.isPending}>{cta}</button>
      </form>
      <p className={cn("news__msg", result?.tone === "warn" && "text-warn")} role="status">
        {result?.text}
        {result?.demo && <> <Link to={result.demo} className="underline">Open the link (demo)</Link></>}
      </p>
      {consent && (
        <p className="m-0 mt-1 text-[.78rem] text-ink-3">
          {consent} See our <Link to="/privacy" className="underline">privacy policy</Link>.
        </p>
      )}
    </div>
  );
}
