/* Shop By Movement */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/ui/Reveal";
import { useHomeContent } from "@/store/tanstackStore/queries/site";

// One photo tile per activity, each opening the shop filtered to it.
export default function Movements() {
  const { data: content } = useHomeContent();
  const movements = content?.movements ?? [];
  if (!movements.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          {/* The label is the heading: the section still needs one for the outline */}
          <h2 className="kicker">Shop by movement</h2>
        </Reveal>
        <div className="grid-movements">
          {movements.map((m) => (
            <Link key={m.id} className="movement" to={`/shop?occasion=${encodeURIComponent(m.occasion)}`}>
              <Photo photo={m.photo} label={m.label} />
              <span className="movement__label">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
