/* Kit Card */
import { Link } from "react-router-dom";

import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { addKit } from "@/utils/kits";
import Photo from "./Photo";

/**
 * A kit in the shop grid, as a product card: the kit pill, its pieces (each
 * a link), the kit price against the pieces bought one by one, and Add all.
 */
export default function KitCard({ kit }) {
  const { add } = useCart();
  const { money } = useCurrency();
  // What buying the pieces one by one would cost beyond the kit price; nothing is shown when the kit isn't cheaper.
  const saving = kit.separate - kit.price;

  return (
    <article className="card card--kit">
      {/* Kit Photo */}
      <div className="card__media">
        <Photo photo={kit.photos[0]} label={kit.name} />
      </div>
      <div className="card__body">
        {/* The pill says it is a kit, with the saving when there is one */}
        <span className="badge">{saving > 0 ? `Kit, save ${money(saving)}` : "Kit"}</span>
        <span className="card__cat">{kit.pieces.length} pieces</span>
        <h3 className="card__name">{kit.name}</h3>
        {/* The pieces in the kit, each a link to its own page */}
        <p className="card__pieces">
          {kit.pieces.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link to={`/product/${p.slug}`}>{p.name}</Link>
            </span>
          ))}
        </p>
        {/* Kit price against the pieces' total, and Add all (checkout charges the kit price while the whole set is in the bag) */}
        <div className="card__foot">
          <span className="card__price">
            {saving > 0 && <s>{money(kit.separate)}</s>} <b>{money(kit.price)}</b>
          </span>
          <button type="button" className="card__add" onClick={() => addKit(kit, kit.pieces, add)} aria-label={`Add all of ${kit.name} to bag`}>Add all</button>
        </div>
      </div>
    </article>
  );
}
