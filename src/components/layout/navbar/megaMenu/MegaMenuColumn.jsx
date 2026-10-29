/* Mega Menu Column */
import { Link } from "react-router-dom";
import { m } from "motion/react";

import { revealItem } from "@/components/motion/revealVariants";

// A titled list of links; arrives with the panel's stagger. The title is a
// quiet small label, the links are set in the display serif.
export default function MegaMenuColumn({ title, links, onNavigate }) {
  return (
    <m.div variants={revealItem}>
      {/* Group title */}
      <p className="mb-5 text-[0.8rem] font-medium text-ink-3">{title}</p>

      {/* Links */}
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.id ?? l.href}>
            <Link to={l.href} onClick={onNavigate} className="font-display text-[1.15rem] leading-snug text-ink transition-colors duration-300 hover:text-brand-600">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
