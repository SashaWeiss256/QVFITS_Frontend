/* Showroom */
import Reveal from "@/components/motion/Reveal";
import { useCurrency } from "@/store/context/CurrencyContext";
import { usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";

// Opening time and links come from the admin's settings, so they change without a deploy.
export default function Showroom() {
  const { data: s } = useSettings();
  const { data: copy } = usePageCopy("about");
  const { money } = useCurrency();
  // Render nothing rather than a block with empty links while settings load.
  if (!s || !copy) return null;
  const room = copy.showroom;
  const tokens = shopTokens(s, money);

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="news center">
          <span className="kicker">{room.kicker}</span>
          <h2>{fill(room.title, tokens)}</h2>
          <p className="lede center">{fill(room.lede, tokens)}</p>
          <div className="relative z-[1] mt-[22px] flex flex-wrap justify-center gap-3">
            <a className="btn btn--primary" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">{room.directions}</a>
            <a className="btn btn--ghost" href={s.instagram} target="_blank" rel="noopener noreferrer">{room.follow}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
