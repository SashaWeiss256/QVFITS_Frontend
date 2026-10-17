/* Style It With */
import { MessageCircle } from "lucide-react";

import { askVee } from "@/components/assistant/askVee";
import Reveal from "@/components/motion/Reveal";
import { useStyleWith } from "@/store/tanstackStore/queries/site";
import OutfitCard from "./OutfitCard";

/**
 * Under a piece: outfits built around it by the same colour engine Vee uses,
 * in the colours that work with it, kits first. Nothing shows when no
 * combination works or stock is short, rather than a weak suggestion.
 */
export default function StyleWith({ product }) {
  const { data: outfits = [] } = useStyleWith(product.type === "kit" ? undefined : product.id);
  if (!outfits.length) return null;

  return (
    <section className="section section--tight" aria-labelledby="style-with">
      <div className="wrap">
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="kicker">Colours checked</span>
            <h2 id="style-with" className="m-0">Style it with</h2>
          </div>
          <button type="button" className="btn btn--ghost" onClick={() => askVee(`What goes with the ${product.name}?`)}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask Vee
          </button>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {outfits.slice(0, 3).map((o) => <OutfitCard key={`${o.kind}-${o.title}-${o.pieces.map((p) => p.colorId).join("")}`} outfit={o} />)}
        </div>
      </div>
    </section>
  );
}
