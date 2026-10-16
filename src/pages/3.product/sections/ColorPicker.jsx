/* Colour Picker */
import { cn } from "@/utils/cn";

// `swatch` maps a colour name to its CSS colour (from the catalogue facets).
export default function ColorPicker({ colors, chosen, onChoose, swatch }) {
  return (
    <div className="opt">
      <div className="opt__head">
        <h2>Colour</h2>
        <span>{chosen}</span>
      </div>
      {/* Radio semantics expose the selected colour to assistive technology. */}
      <div className="swatch-row" role="radiogroup" aria-label="Colour">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === chosen}
            aria-label={c}
            className={cn("swatch-btn", c === chosen && "is-on")}
            style={{ background: swatch(c) }}
            onClick={() => onChoose(c)}
          />
        ))}
      </div>
    </div>
  );
}
