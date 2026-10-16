/* Size Chart */
import { useState } from "react";

import Reveal from "@/components/motion/Reveal";
import { useSizeChart } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { formatRange } from "@/utils/sizing";

// The chart is stored in cm; inches are converted on display only.
export default function Chart() {
  const { data: rows = [] } = useSizeChart();
  const [unit, setUnit] = useState("cm");

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head section-head--row">
          <div>
            <span className="kicker">The numbers</span>
            <h2>Size chart</h2>
          </div>
          <div className="unit-toggle" role="group" aria-label="Units">
            {[["cm", "cm"], ["in", "inches"]].map(([id, label]) => (
              <button key={id} type="button" className={cn(unit === id && "is-on")} aria-pressed={unit === id} onClick={() => setUnit(id)}>{label}</button>
            ))}
          </div>
        </Reveal>
        {/* table-wrap scrolls sideways on a phone instead of squashing the columns. */}
        <div className="table-wrap">
          <table className="size">
            <thead>
              <tr><th scope="col">Size</th><th scope="col">UK</th><th scope="col">US</th><th scope="col">EU</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Hip</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.size}>
                  <th scope="row">{r.size}</th><td>{r.uk}</td><td>{r.us}</td><td>{r.eu}</td>
                  <td>{formatRange(r.bust, unit)}</td><td>{formatRange(r.waist, unit)}</td><td>{formatRange(r.hip, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3.5 text-[.86rem] text-ink-3">
          Between two sizes? Go by the measurement that matters most for the piece: bust for a fitted top, hip for a skort. Every product page carries its own fit note.
        </p>
      </div>
    </section>
  );
}
