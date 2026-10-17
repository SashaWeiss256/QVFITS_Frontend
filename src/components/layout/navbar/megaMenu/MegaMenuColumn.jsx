/* Mega Menu Column */
import { Link } from "react-router-dom";
import { m } from "motion/react";

import { revealItem } from "@/components/motion/revealVariants";

// A titled list of links; arrives with the panel's stagger.
export default function MegaMenuColumn({ title, links, onNavigate }) {
  return (
    <m.div variants={revealItem}>
      <p className="mega__title">{title}</p>
      <ul className="mega__list">
        {links.map((l) => (
          <li key={l.id ?? l.href}>
            <Link to={l.href} onClick={onNavigate}>{l.title}</Link>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
