/* Newsletter Form */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { demoEmailLink, useNewsletterConsent, useSubscribe } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Join the newsletter, from the footer or anywhere else: one field on a
 * single hairline with an arrow button at its end, the agreed words under
 * it (stored with the address). Double opt-in: the address is only on the
 * list once the emailed link is opened. Until an email service is connected
 * the email waits in the admin's outbox; a dev build shows its link here.
 * tone="brand" (or "dark") is for dark grounds: cream line and type.
 */
export default function NewsletterForm({ source, placeholder = "Your email address", cta = "Sign up", className, formId, tone = "light" }) {
  const dark = tone === "brand" || tone === "dark";
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
      {/* Field and button on one hairline */}
      <form className={cn("flex items-center border-b transition-colors focus-within:border-current", dark ? "border-cream/40" : "border-ink/30")} id={formId} noValidate onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label={t("Email address")}
          autoComplete="email"
          required
          className={cn("min-h-14 min-w-0 flex-1 bg-transparent text-[1rem] outline-none", dark ? "placeholder:text-cream/45" : "placeholder:text-ink-4")}
        />
        <button className="inline-flex min-h-14 items-center gap-2 pl-4 text-[0.9rem] font-medium transition-opacity hover:opacity-70 disabled:opacity-40" type="submit" disabled={subscribe.isPending}>
          {cta} <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </form>

      {/* What happened */}
      <p className={cn("mt-3 min-h-[1.4em] text-[0.88rem]", result?.tone === "warn" ? (dark ? "text-[#f2b8a8]" : "text-warn") : dark ? "text-cream/85" : "text-ink-2")} role="status">
        {result?.text}
        {result?.demo && <> <Link to={result.demo} className="underline">Open the link (demo)</Link></>}
      </p>

      {/* What the shopper agrees to */}
      {consent && (
        <p className={cn("mt-1 text-[0.78rem] leading-relaxed", dark ? "text-cream/55" : "text-ink-3")}>
          {consent} See our <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.
        </p>
      )}
    </div>
  );
}
