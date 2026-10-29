/* Share Product */
import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { t } from "@/i18n/translate";
import { notify } from "@/store/tanstackStore/notices";

const BUTTON = "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[0.88rem] text-ink-2 transition-colors duration-200 hover:border-line-2 hover:text-ink";

// Copies the text, with the older way for browsers that block the clipboard on plain http.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      const ok = document.execCommand("copy");
      box.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Copy the piece's link, send it on WhatsApp, or hand it to any other app
 * through the phone's own share sheet (only shown where the browser has one).
 * The link is the piece's own page, without any colour or size picked.
 */
export default function ShareProduct({ product: p }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const url = `${window.location.origin}/product/${p.slug}`;
  const message = `${p.name} by QVFITS`;

  const copy = async () => {
    const ok = await copyText(url);
    if (!ok) return notify("Could not copy the link. Copy it from the address bar instead.");
    setCopied(true);
    notify("Link copied");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };
  // Closing the share sheet without choosing an app is not an error.
  const share = () => navigator.share({ title: message, text: message, url }).catch(() => {});

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={t("Share this piece")}>
      <span className="mr-1 hidden text-[0.88rem] text-ink-3 sm:inline">{t("Share")}</span>
      <button type="button" className={BUTTON} onClick={copy}>
        {copied ? <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden="true" /> : <Link2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        <span aria-live="polite">{copied ? t("Copied") : t("Copy link")}</span>
      </button>
      <a className={BUTTON} href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> WhatsApp
      </a>
      {canShare && (
        <button type="button" className={BUTTON} onClick={share}>
          <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {t("More")}
        </button>
      )}
    </div>
  );
}
