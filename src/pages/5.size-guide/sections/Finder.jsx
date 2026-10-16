/* Find Your Size */
import { useState } from "react";
import { Link } from "react-router-dom";

import { askVee } from "@/components/assistant/askVee";
import Reveal from "@/components/motion/Reveal";
import { useProducts, useSizeChart } from "@/store/tanstackStore/queries/site";
import { findSize } from "@/utils/sizing";
import { inStock } from "@/utils/stockLevel";

// Placeholders are a typical size M, so the fields read as an example.
const FIELDS = [
  { key: "bust", label: "Bust (cm)", placeholder: "88" },
  { key: "waist", label: "Waist (cm)", placeholder: "70" },
  { key: "hip", label: "Hip (cm)", placeholder: "96" },
];

// Any one measurement is enough. findSize picks the nearest band, then moves
// up a size for a piece that runs small. Vee uses the same maths.
export default function Finder({ presetId }) {
  const { data: chart = [] } = useSizeChart();
  const { data: products = [] } = useProducts();
  const [m, setM] = useState({ bust: "", waist: "", hip: "" });
  const [pieceId, setPieceId] = useState(presetId ?? "");
  const [result, setResult] = useState(null);

  const piece = products.find((p) => p.id === pieceId);
  // Empty or unreadable input counts as "not given", never as zero.
  const num = (v) => (v === "" ? null : parseFloat(v) || null);

  const go = (e) => {
    e.preventDefault();
    const values = { bust: num(m.bust), waist: num(m.waist), hip: num(m.hip) };
    if (!values.bust && !values.waist && !values.hip) return setResult({ empty: true });
    setResult(findSize(chart, values, piece));
  };

  return (
    <Reveal as="form" className="measure-card" noValidate onSubmit={go}>
      <span className="kicker">No guessing</span>
      <h2 className="mb-1.5 text-[1.5rem]">Find your size</h2>
      <p className="text-[.92rem] text-ink-3">Pop your measurements in. If you pick a piece, we&apos;ll adjust for how that one actually fits.</p>
      <div className="field-row mt-[18px]">
        {FIELDS.map((f) => (
          <div key={f.key} className="field">
            <label htmlFor={`m-${f.key}`}>{f.label}</label>
            <input id={`m-${f.key}`} type="number" inputMode="decimal" min="40" max="170" placeholder={f.placeholder} value={m[f.key]} onChange={(e) => setM({ ...m, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="field mt-3.5">
        <label htmlFor="m-piece">For a specific piece (optional)</label>
        <select id="m-piece" value={pieceId} onChange={(e) => setPieceId(e.target.value)}>
          <option value="">Any piece: general sizing</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <button className="btn btn--primary btn--block mt-[18px]" type="submit">Show me my size</button>

      {/* Result: the size, the piece's fit note, then stock for that size. */}
      {result && (
        <div className="result" role="status">
          {result.empty ? (
            "Pop in at least one measurement and we'll take it from there."
          ) : (
            <>
              You&apos;re a <strong>{result.size}</strong>{result.exact ? "" : " (closest match)"}. {result.note}
              {/* Only check stock when a piece was picked. */}
              {piece && (inStock(piece, result.size) ? (
                <><br /><span className="font-semibold text-success">In stock in {result.size}.</span>{" "}<Link to={`/product/${piece.slug}`} className="text-brand-600 underline">Take me to it</Link></>
              ) : (
                <><br /><span className="font-semibold text-warn">Sold out in {result.size} right now.</span> Ask us on WhatsApp whether it&apos;s coming back.</>
              ))}
              <br /><br />
              <button type="button" className="text-[.86rem] text-ink-3 underline" onClick={() => askVee(`I'm a ${result.size}. Which pieces should I look at?`)}>Still unsure? Ask Vee</button>
            </>
          )}
        </div>
      )}
    </Reveal>
  );
}
