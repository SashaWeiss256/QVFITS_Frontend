/* Assistant Message */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { useCurrency } from "@/store/context/CurrencyContext";
import { anyInStock } from "@/utils/stockLevel";

/**
 * One turn of the chat. Vee's replies are blocks: paragraphs, product cards
 * and links, never raw HTML. `onLeave` closes the panel when a link is followed.
 */
export default function AssistantMessage({ message, onLeave }) {
  const { money } = useCurrency();
  if (message.from === "me") return <div className="msg msg--me">{message.text}</div>;

  return message.blocks.map((b, i) => {
    if (b.type === "text") {
      return <div key={i} className="msg msg--bot">{b.paras.map((p) => <p key={p}>{p}</p>)}</div>;
    }
    if (b.type === "cards" && b.products.length) {
      return (
        <div key={i} className="asst-cards">
          {b.products.map((p) => (
            <Link key={p.id} className="asst-card" to={`/product/${p.slug}`} onClick={onLeave}>
              <div className="asst-card__media"><Photo photo={p.photos[0]} label={p.name} /></div>
              <div>
                <strong>{p.name}</strong>
                <small>{p.category}{anyInStock(p) ? "" : " · sold out"}</small>
                <div className="price">{money(p.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      );
    }
    if (b.type === "link") {
      const inner = <>{b.label} <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" /></>;
      return (
        <p key={i} className="msg msg--bot">
          {b.external ? (
            <a className="link-arrow" href={b.to} target="_blank" rel="noopener noreferrer">{inner}</a>
          ) : (
            <Link className="link-arrow" to={b.to} onClick={onLeave}>{inner}</Link>
          )}
        </p>
      );
    }
    return null;
  });
}
