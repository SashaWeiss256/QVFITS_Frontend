/* Newsletter Confirm */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import { useConfirmSubscription } from "@/store/tanstackStore/queries/site";
import { t } from "@/i18n/translate";

// Where the confirmation email's link lands: the address joins the list.
export default function NewsletterConfirm() {
  useSeo({ title: "Newsletter", noindex: true });
  const [params] = useSearchParams();
  const confirm = useConfirmSubscription();
  const [state, setState] = useState({ status: "working" });
  const once = useRef(false);

  useEffect(() => {
    // One request per visit, even when React runs effects twice in development.
    if (once.current) return;
    once.current = true;
    const token = params.get("token") ?? "";
    confirm.mutateAsync(token).then(
      (s) => setState({ status: "done", email: s.email }),
      (e) => setState({ status: "failed", message: e.message }),
    );
  }, [params, confirm]);

  return (
    <section className="wrap section center">
      <p className="kicker">Newsletter</p>
      {state.status === "working" && <h1>One moment…</h1>}
      {state.status === "done" && (
        <>
          <h1>You're on the list</h1>
          <p className="lede center mt-5">{state.email} will hear about new drops and restocks first. Your welcome email is on its way.</p>
        </>
      )}
      {state.status === "failed" && (
        <>
          <h1>That link didn't work</h1>
          <p className="lede center mt-5">{state.message}</p>
        </>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className="btn btn--primary">{t("Shop the range")}</Link>
        <Link to="/" className="btn btn--ghost">{t("Back home")}</Link>
      </div>
    </section>
  );
}
