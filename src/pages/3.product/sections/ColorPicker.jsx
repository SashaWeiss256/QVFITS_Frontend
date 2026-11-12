/* Colour Picker */
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// Round swatches; the chosen one wears a thin ring that draws in around it,
// and hovering or focusing one lifts its name in a small bubble above it.
// `swatch` maps a colour name to its CSS colour (from the catalogue facets).
export default function ColorPicker({ colors, chosen, onChoose, swatch }) {
  return (
    <div>
      {/* Heading: the colour's name */}
      <p className="mb-3 text-[0.88rem] text-ink-3">
        Colour <span className="ml-1 text-ink">{chosen}</span>
      </p>
      {/* Radio semantics expose the selected colour to assistive technology. */}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("Colour")}>
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === chosen}
            aria-label={c}
            className="group relative grid h-12 w-12 place-items-center rounded-full"
            onClick={() => onChoose(c)}
          >
            <span className={cn("absolute inset-0 rounded-full border border-ink transition-all duration-500 ease-q", c === chosen ? "scale-100 opacity-100" : "scale-75 opacity-0")} aria-hidden="true" />
            <span className="h-9 w-9 rounded-full shadow-[inset_0_0_0_1px_rgb(23_33_31/0.2)]" style={{ background: swatch(c) }} />
            {/* Name bubble, with a small pointer toward the swatch */}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-line bg-cream px-3.5 py-1.5 text-[0.9rem] text-ink opacity-0 shadow-sh-2 transition-[opacity,transform] duration-300 ease-q [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100" aria-hidden="true">
              {c}
              <span className="absolute left-1/2 top-full -mt-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-line bg-cream" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
