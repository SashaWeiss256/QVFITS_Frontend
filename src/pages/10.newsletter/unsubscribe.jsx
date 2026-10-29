/* Newsletter Unsubscribe */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import { useUnsubscribe } from "@/store/tanstackStore/queries/site";
import { t } from "@/i18n/translate";

// Every email's unsubscribe link lands here; one visit is enough, no sign-in.
export default function NewsletterUnsubscribe() {
  useSeo({ title: "Unsubscribe", noindex: true });
  const [params] = useSearchParams();
  const unsubscribe = useUnsubscribe();
  const [state, setState] = useState({ status: "working" });
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    unsubscribe.mutateAsync(params.get("token") ?? "").then(
      (r) => setState({ status: "done", email: r.email }),
      (e) => setState({ status: "failed", message: e.message }),
    );
  }, [params, unsubscribe]);

  return (
    <section className="wrap section center">
      <p className="kicker">Newsletter</p>
      {state.status === "working" && <h1>One moment…</h1>}
      {state.status === "done" && (
        <>
          <h1>You're unsubscribed</h1>
          <p className="lede center mt-5">We won't email {state.email} about drops and offers again. Order emails still arrive as usual.</p>
        </>
      )}
      {state.status === "failed" && (
        <>
          <h1>That link didn't work</h1>
          <p className="lede center mt-5">{state.message}</p>
        </>
      )}
      <div className="mt-6 flex sm:justify-center">
        <Link to="/" className="btn btn--ghost">{t("Back home")}</Link>
      </div>
    </section>
  );
}
