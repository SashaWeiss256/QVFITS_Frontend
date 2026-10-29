/* How Each Piece Fits */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import { useProducts } from "@/store/tanstackStore/queries/site";
import { FIT_LABELS } from "@/utils/sizing";
import { t } from "@/i18n/translate";

// Built from the live catalogue, so a new piece's fit note shows up here without editing the page.
export default function FitNotes() {
  const { data: products = [] } = useProducts();

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="kicker">Piece by piece</span>
          <h2>How each piece fits</h2>
          <p className="lede">Pulled straight from the rail. If it runs small, we say so.</p>
        </Reveal>
        <div className="table-wrap">
          <table className="size">
            <thead><tr><th scope="col">Piece</th><th scope="col">{t("Category")}</th><th scope="col">Fit</th><th scope="col">Note</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/product/${p.slug}`} className="text-brand-600">{p.name}</Link></td>
                  <td>{p.category}</td>
                  {/* A piece with no fit set is treated as true to size. */}
                  <td>{FIT_LABELS[p.fit] ?? "True to size"}</td>
                  <td className="text-ink-3">{p.fitNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
