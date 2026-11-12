/* Assistant Message */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import OutfitCard from "@/components/storefront/OutfitCard";
import Photo from "@/components/storefront/Photo";
import { useCurrency } from "@/store/context/CurrencyContext";
import { anyInStock } from "@/utils/stockLevel";

/**
 * One turn of the chat. Vee's replies are blocks: paragraphs, product cards
 * and links, never raw HTML. `onLeave` closes the panel when a link is followed.
 * An outfit is a card of pieces with its reason and one button that adds every
 * piece in the colour and size shown; quick replies run only on the newest message.
 */
export default function AssistantMessage({ message, onLeave, onAsk, isLast }) {
  const { money } = useCurrency();
  if (message.from === "me") return <div className="max-w-[85%] self-end bg-ink px-4 py-3 text-[0.92rem] leading-relaxed text-cream">{message.text}</div>;

  return message.blocks.map((b, i) => {
    if (b.type === "text") {
      return <div key={i} className="max-w-[92%] self-start space-y-2 text-[0.95rem] leading-relaxed text-ink-2">{b.paras.map((p) => <p key={p}>{p}</p>)}</div>;
    }
    if (b.type === "cards" && b.products.length) {
      return (
        <div key={i} className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-1">
          {b.products.map((p) => (
            <Link key={p.id} className="group w-[150px] shrink-0 snap-start" to={`/product/${p.slug}`} onClick={onLeave}>
              <div className="relative aspect-[3/4] overflow-hidden bg-beige"><Photo photo={p.photos[0]} label={p.name} /></div>
              <p className="mt-2 text-[0.92rem] leading-snug group-hover:text-brand-600">{p.name}</p>
              <p className="mt-0.5 text-[0.8rem] text-ink-3">{money(p.price)}{anyInStock(p) ? "" : ", sold out"}</p>
            </Link>
          ))}
        </div>
      );
    }
    // In the chat the card takes its own height (the wrapper has none to fill), so its price and button stay inside it.
    if (b.type === "outfit") return <div key={i} className="shrink-0"><OutfitCard outfit={b.outfit} onLeave={onLeave} /></div>;
    if (b.type === "chips") {
      // Quick replies: tapping one sends it as the shopper's next message. Only the newest set is live.
      if (!isLast) return null;
      return (
        <div key={i} className="flex flex-wrap gap-2" role="group" aria-label="Quick replies">
          {b.options.map((c) => <button key={c} type="button" className="min-h-9 border border-ink/20 px-3.5 text-[0.82rem] text-ink-2 transition-colors hover:border-ink hover:text-ink" onClick={() => onAsk(c)}>{c}</button>)}
        </div>
      );
    }
    if (b.type === "link") {
      const inner = <>{b.label} <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" /></>;
      return (
        <p key={i} className="self-start text-[0.92rem]">
          {b.external ? (
            <a className="link-arrow inline-flex items-center gap-1.5" href={b.to} target="_blank" rel="noopener noreferrer">{inner}</a>
          ) : (
            <Link className="link-arrow inline-flex items-center gap-1.5" to={b.to} onClick={onLeave}>{inner}</Link>
          )}
        </p>
      );
    }
    return null;
  });
}
