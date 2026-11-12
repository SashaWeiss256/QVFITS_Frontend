/* Share Product */
import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { t } from "@/i18n/translate";
import { notify } from "@/store/tanstackStore/notices";
import { useClickOutside } from "@/utils/useClickOutside";
import { cn } from "@/utils/cn";

const ITEM = "flex min-h-11 w-full items-center gap-3 px-4 text-left text-[0.9rem] text-ink-2 transition-colors hover:bg-sand-50 hover:text-ink";

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
 * One quiet share icon beside "save". Where the phone has its own share
 * sheet, a tap opens it; elsewhere a small menu offers Copy link and
 * WhatsApp. The link is the piece's own page, with no colour or size picked.
 */
export default function ShareProduct({ product: p }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  useClickOutside(ref, () => setOpen(false), open);

  const url = `${window.location.origin}/product/${p.slug}`;
  const message = `${p.name} by QVFITS`;

  const copy = async () => {
    const ok = await copyText(url);
    if (!ok) return notify("Could not copy the link. Copy it from the address bar instead.");
    setCopied(true);
    notify("Link copied");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setCopied(false); setOpen(false); }, 1400);
  };

  // A phone's own sheet when there is one (closing it without choosing is not an error); otherwise the menu.
  const onButton = () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title: message, text: message, url }).catch(() => {});
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="btn btn--ghost btn--lg w-[56px] px-0" aria-label={t("Share this piece")} aria-haspopup="menu" aria-expanded={open} onClick={onButton}>
        <Share2 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className={cn("absolute right-0 top-[calc(100%+8px)] z-20 w-48 border border-line bg-cream py-1.5 shadow-sh-3", !open && "hidden")} role="menu">
        <button type="button" role="menuitem" className={ITEM} onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden="true" /> : <Link2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
          <span aria-live="polite">{copied ? t("Copied") : t("Copy link")}</span>
        </button>
        <a role="menuitem" className={ITEM} href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
