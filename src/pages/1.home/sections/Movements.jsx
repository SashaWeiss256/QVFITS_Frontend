/* Shop By Movement */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";

// The movements as one sideways row of tall photographs set edge to edge,
// each opening the movement it was given in the admin. The name sits under
// its picture, centred and in regular weight, never on the photograph.
// Hovering slowly brings the photo closer.
export default function Movements({ movements }) {
  if (!movements?.items?.length) return null;

  return (
    <section className="section">
      <div className="wrap">
        {/* Heading */}
        <Reveal className="mb-8 sm:mb-10">
          <h2 className="text-[clamp(1.35rem,2vw,1.8rem)]">{movements.title}</h2>
        </Reveal>

        {/* Row of tiles, swiped or scrolled sideways, with no gaps between the pictures */}
        <div className="-mx-[clamp(20px,4vw,56px)] flex snap-x snap-mandatory overflow-x-auto scroll-px-[clamp(20px,4vw,56px)] px-[clamp(20px,4vw,56px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={movements.title} tabIndex={0}>
          {movements.items.map((m) => (
            <Link key={m.id} className="group block w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[calc(100%/5.5)] lg:grow" to={m.href}>
              <span className="relative block aspect-[3/4] overflow-hidden bg-sand-100">
                <Photo photo={m.photo} label={m.label} className="transition-transform duration-[1.6s] ease-q group-hover:scale-[1.05]" />
              </span>
              <span className="mt-4 block py-1 text-center text-[0.95rem] font-normal text-ink transition-colors group-hover:text-brand-600">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
