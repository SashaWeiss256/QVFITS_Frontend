/* Colour Picker */
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// Round swatches; the chosen one wears a thin ring that draws in around it.
// `swatch` maps a colour name to its CSS colour (from the catalogue facets).
export default function ColorPicker({ colors, chosen, onChoose, swatch }) {
  return (
    <div>
      {/* Heading: the colour's name */}
      <p className="mb-3 text-[0.88rem] text-ink-3">
        Colour <span className="ml-1 font-display font-semibold text-ink">{chosen}</span>
      </p>
      {/* Radio semantics expose the selected colour to assistive technology. */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("Colour")}>
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === chosen}
            aria-label={c}
            title={c}
            className="relative grid h-11 w-11 place-items-center rounded-full"
            onClick={() => onChoose(c)}
          >
            <span className={cn("absolute inset-0 rounded-full border border-ink transition-all duration-500 ease-q", c === chosen ? "scale-100 opacity-100" : "scale-75 opacity-0")} aria-hidden="true" />
            <span className={cn("h-8 w-8 rounded-full shadow-[inset_0_0_0_1px_rgb(23_33_31/0.15)] transition-transform duration-300", c !== chosen && "hover:scale-110")} style={{ background: swatch(c) }} />
          </button>
        ))}
      </div>
    </div>
  );
}
