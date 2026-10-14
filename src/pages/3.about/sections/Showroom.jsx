/* Showroom */
import Reveal from "@/components/ui/Reveal";
import { useSettings } from "@/store/tanstackStore/queries/site";

export default function Showroom() {
  const { data: s } = useSettings();
  if (!s) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="news center">
          <span className="kicker">Come and try</span>
          <h2>THE CUBE, G17 Kisementi</h2>
          <p className="lede center">The shop opens at {s.opensAt}. Trying things on is half the fun, and it&apos;s the fastest way to find your size.</p>
          <div className="relative z-[1] mt-[22px] flex flex-wrap justify-center gap-3">
            <a className="btn btn--primary" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a>
            <a className="btn btn--ghost" href={s.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
