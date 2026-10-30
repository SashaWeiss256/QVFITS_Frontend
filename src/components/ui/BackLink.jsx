/* Back Link */
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { t } from "@/i18n/translate";

/**
 * "Back" at the end of the breadcrumb line: goes to the page the shopper
 * came from. When the page was opened fresh (a shared link, a new tab) there
 * is nothing behind it, so it goes to `fallback` instead of leaving the site.
 */
export default function BackLink({ fallback = "/shop" }) {
  const navigate = useNavigate();
  const back = () => {
    // React Router counts its own history entries: above 0 means there is a page behind this one.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(fallback);
  };
  return (
    <button type="button" onClick={back} className="ml-auto inline-flex items-center gap-1.5 py-[11px] -my-[11px] text-ink-2 transition-colors hover:text-ink">
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> {t("Back")}
    </button>
  );
}
