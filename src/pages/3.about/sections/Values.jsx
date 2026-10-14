/* How We Do Things */
import { Clock, Heart, Check, Sparkles } from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";

export default function Values() {
  const { data: s } = useSettings();
  const { money } = useCurrency();

  const values = [
    { icon: Heart, title: "Chosen, not bulk-ordered", text: "Small drops per colourway. If you see it in the studio, only a handful of people in Kampala will be training in it." },
    { icon: Check, title: "Honest about fit", text: "Every piece carries a real fit note: runs small, cut relaxed, true to size. We would rather you order once." },
    { icon: Clock, title: "Styled, not just sold", text: "Tell us what you train in and we'll have pieces waiting. Come and move in them before you buy." },
    { icon: Sparkles, title: "Delivered across Uganda", text: s ? `Kampala and upcountry, or collect from the showroom. Free delivery over ${money(s.freeShippingOver)}.` : "Kampala and upcountry, or collect from the showroom." },
  ];

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">How we build</span>
          <h2>How we do things</h2>
        </Reveal>
        <div className="values">
          {values.map(({ icon: Icon, title, text }) => (
            <Reveal key={title} className="value">
              <div className="value__icon"><Icon className="h-[22px] w-[22px]" aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p className="mt-2 mb-0 text-[.93rem] text-ink-2">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
