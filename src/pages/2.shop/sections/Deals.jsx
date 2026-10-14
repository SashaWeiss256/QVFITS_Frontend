/* Deals (from Quivogue shop.html renderDeals()) */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import { useOffers, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

// The live deal cards from Offers in the admin. A deal with no link opens
// WhatsApp with the question already typed.
export default function Deals() {
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const live = (offers?.deals ?? []).filter((d) => d.live);
  if (!live.length || !settings) return null;

  return (
    <section className="section section--tight" aria-labelledby="dealsTitle">
      <div className="wrap">
        <h2 className="sr-only" id="dealsTitle">Current offers</h2>
        <div className="deals">
          {live.map((d) => {
            const body = (
              <>
                <span className="deal__tag">{d.tag}</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
                <span className="link-arrow">{d.cta} <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" /></span>
              </>
            );
            return (
              <Reveal key={d.id} className="flex">
                {d.href ? (
                  <Link className={`deal deal--${d.tone} w-full`} to={d.href}>{body}</Link>
                ) : (
                  <a className={`deal deal--${d.tone} w-full`} href={whatsappLink(settings.whatsapp, "Hi QV fits! What's on offer this week?")} target="_blank" rel="noopener noreferrer">{body}</a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
