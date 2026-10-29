/* Shop By Movement */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";

// The movements as one edge-to-edge band of tall photographs, no gaps, each
// opening the movement it was given in the admin. The name sits large on the
// picture; hovering slowly brings the photo closer and underlines the name.
export default function Movements({ movements }) {
  if (!movements?.items?.length) return null;

  return (
    <section className="pb-[clamp(64px,9vw,128px)]">
      {/* Heading */}
      <div className="wrap mb-10">
        <Reveal as="div"><h2>{movements.title}</h2></Reveal>
      </div>

      {/* Band of tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {movements.items.map((m) => (
          <Link key={m.id} className="group relative block aspect-[3/4] overflow-hidden bg-sand-100 lg:aspect-[2/3]" to={m.href}>
            {/* Picture */}
            <Photo photo={m.photo} label={m.label} className="transition-transform duration-[1.6s] ease-q group-hover:scale-[1.05]" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" aria-hidden="true" />

            {/* Name */}
            <span className="absolute inset-x-4 bottom-5 font-display text-[clamp(1.25rem,2.6vw,2.4rem)] leading-tight text-cream sm:inset-x-5 sm:bottom-6 lg:inset-x-8 lg:bottom-9">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-700 ease-q group-hover:bg-[length:100%_1px]">{m.label}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
