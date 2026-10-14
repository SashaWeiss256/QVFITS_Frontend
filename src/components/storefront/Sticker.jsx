/* Offer Sticker (from Quivogue initSticker()) */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

import { useOffers } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { readStored, writeStored } from "@/utils/storage";

/**
 * The small dismissible offer card. Shown only while the offer is live in
 * the admin, and only after BOTH the delay and a scroll, so it never drops
 * over the hero's Shop now button. Closing it is remembered for snoozeDays.
 * Its link goes to the newsletter form on the home page.
 */
export default function Sticker() {
  const { data: offers } = useOffers();
  const s = offers?.sticker;
  const key = `qvfits:sticker:${s?.tag ?? "offer"}`;
  const [shown, setShown] = useState(false);
  const [closed, setClosed] = useState(() => Date.now() < Number(readStored(key, 0)));
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const live = Boolean(s?.live) && !closed;

  useEffect(() => {
    if (!live) return undefined;
    let waited = false;
    let moved = window.scrollY > 400;
    const show = () => waited && moved && setShown(true);
    const onScroll = () => {
      if (window.scrollY > 400) {
        moved = true;
        show();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(() => {
      waited = true;
      show();
    }, Number(s.delayMs) || 6000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [live, s]);

  if (!live) return null;

  const dismiss = () => {
    setShown(false);
    writeStored(key, Date.now() + (Number(s.snoozeDays) || 14) * 864e5);
    setTimeout(() => setClosed(true), 280);
  };

  const go = () => {
    dismiss();
    const focusForm = () => {
      const form = document.getElementById("newsForm");
      form?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => form?.querySelector("input")?.focus({ preventScroll: true }), 700);
    };
    if (pathname === "/") focusForm();
    else {
      navigate("/");
      setTimeout(focusForm, 600);
    }
  };

  return (
    <aside className={cn("sticker", shown && "is-in")} aria-label={s.title}>
      <button type="button" className="sticker__x" aria-label="Close this offer" onClick={dismiss}>
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="sticker__tag">{s.tag}</span>
      <p className="sticker__title">{s.title}</p>
      <p className="sticker__text">{s.text}</p>
      <button type="button" className="sticker__cta" onClick={go}>
        {s.cta} <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
      </button>
    </aside>
  );
}
