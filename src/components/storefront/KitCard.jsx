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
  const saving = kit.separate - kit.price;

  return (
    <article className="card card--kit">
      <div className="card__media">
        <Photo photo={kit.photos[0]} label={kit.name} />
      </div>
      <div className="card__body">
        <span className="badge">{saving > 0 ? `Kit, save ${money(saving)}` : "Kit"}</span>
        <span className="card__cat">{kit.pieces.length} pieces</span>
        <h3 className="card__name">{kit.name}</h3>
        <p className="card__pieces">
          {kit.pieces.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <Link to={`/product/${p.slug}`}>{p.name}</Link>
            </span>
          ))}
        </p>
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
