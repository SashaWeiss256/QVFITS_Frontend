/* How We Do Things */
import { Check, Clock, Heart, Sparkles, Star, Truck } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import { useCurrency } from "@/store/context/CurrencyContext";
import { usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";

// The admin picks one of these by name for each value card.
const ICONS = { heart: Heart, check: Check, clock: Clock, sparkles: Sparkles, star: Star, truck: Truck };

export default function Values() {
  const { data: s } = useSettings();
  const { data: copy } = usePageCopy("about");
  const { money } = useCurrency();
  const values = copy?.values;
  if (!values?.items.length) return null;
  // A card may quote a live number, e.g. {freeShipping}.
  const tokens = shopTokens(s, money);

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{values.kicker}</span>
          <h2>{values.title}</h2>
        </Reveal>
        <div className="values">
          {values.items.map((v) => {
            const Icon = ICONS[v.icon] ?? Sparkles;
            return (
              <Reveal key={v.title} className="value">
                <div className="value__icon"><Icon className="h-[22px] w-[22px]" aria-hidden="true" /></div>
                <h3>{v.title}</h3>
                <p className="mt-2 mb-0 text-[.93rem] text-ink-2">{fill(v.text, tokens)}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
