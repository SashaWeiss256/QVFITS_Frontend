/* Shop By Movement */
import { Link } from "react-router-dom";

import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";

// Four tiles in a row, as on the original: each opens the shop filtered to
// that activity. The label is the heading, at the client's request.
export default function Movements({ movements }) {
  if (!movements?.items?.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="section-head center">
          <h2 className="kicker">{movements.title}</h2>
        </div>
        <RevealGroup className="grid-movements" stagger={0.08}>
          {movements.items.map((m) => (
            <RevealItem key={m.id} className="flex">
              <Link className="movement w-full" to={`/shop?occasion=${encodeURIComponent(m.occasion)}`}>
                <Photo photo={m.photo} label={m.label} />
                <span className="movement__label">{m.label}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
