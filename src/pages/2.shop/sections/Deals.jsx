/* Deals (from Quivogue shop.html renderDeals()) */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import { useOffers, usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { whatsappLink } from "@/utils/whatsapp";

// Each tone as the card, its tag, its text and its link.
const TONES = {
  brand: { card: "border-line bg-sand-100 text-ink", tag: "bg-[image:var(--brand-grad)] text-white", text: "text-ink-2", link: "" },
  dark: { card: "bg-ink text-cream", tag: "bg-cream/14", text: "text-cream/78", link: "text-cream" },
  teal: { card: "bg-teal-500 text-cream", tag: "bg-cream/16", text: "text-cream/85", link: "text-cream" },
};

// The live deal cards from Offers in the admin. A deal with no link opens
// WhatsApp with the question already typed.
export default function Deals() {
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const { data: copy } = usePageCopy("shop");
  const live = (offers?.deals ?? []).filter((d) => d.live);
  // Settings carry the WhatsApp number a link-less deal needs.
  if (!live.length || !settings) return null;

  return (
    <section className="section section--tight" aria-labelledby="dealsTitle">
      <div className="wrap">
        <h2 className="sr-only" id="dealsTitle">Current offers</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {live.map((d) => {
            const tone = TONES[d.tone] ?? TONES.brand;
            const card = cn(
              "relative flex min-h-[220px] w-full flex-col gap-2.5 rounded-[22px] border border-transparent p-[clamp(22px,2.4vw,32px)]",
              "transition-[translate,box-shadow] duration-500 ease-q hover:-translate-y-1 hover:shadow-[0_18px_36px_rgb(23_33_31/0.14)]",
              tone.card,
            );
            // Same card content whether it renders as an internal link or a WhatsApp link.
            const body = (
              <>
                <span className={cn("self-start rounded-full px-[0.9em] py-[0.3em] text-[0.74rem] font-medium", tone.tag)}>{d.tag}</span>
                <h3 className="mb-0 mt-1.5 text-[clamp(1.55rem,2.4vw,2.1rem)] leading-[1.05] text-inherit">{d.title}</h3>
                <p className={cn("m-0 max-w-[34ch] flex-1 text-[0.95rem]", tone.text)}>{d.text}</p>
                <span className={cn("link-arrow mt-2.5 self-start", tone.link)}>{d.cta} <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" /></span>
              </>
            );
            return (
              <Reveal key={d.id} className="flex">
                {d.href ? (
                  <Link className={card} to={d.href}>{body}</Link>
                ) : (
                  <a className={card} href={whatsappLink(settings.whatsapp, copy?.dealsWhatsapp)} target="_blank" rel="noopener noreferrer">{body}</a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
