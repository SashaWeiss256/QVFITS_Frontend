/* Not Found (from Quivogue 404.html) */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import { t } from "@/i18n/translate";

export default function NotFound() {
  // Served with status 200 by the SPA fallback, so keep it out of search.
  useSeo({ title: "Page not found", noindex: true });
  const { data: copy } = usePageCopy("notFound");
  return (
    <section className="wrap section center">
      <p className="kicker">{copy?.kicker}</p>
      <h1>{copy?.title}</h1>
      <p className="lede center mt-5">{copy?.lede}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className="btn btn--primary">{t("Shop the range")}</Link>
        <Link to="/" className="btn btn--ghost">{t("Back home")}</Link>
      </div>
    </section>
  );
}
