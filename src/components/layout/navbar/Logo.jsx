/* Logo */
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * The QVFITS logo as on the original Quivogue site: the supplied artwork
 * (wave mark, QVFITS under it, EST. 2023) on the left; on the right QVFITS
 * large in Anton with the brand gradient, and QUIVOGUE small beneath it,
 * spread to exactly the width of QVFITS. The words are live text so they stay
 * sharp and readable at header size (docs/04-design-system.md, Logo).
 */
const SUB = "QUIVOGUE".split("");

export default function Logo({ size = "md", to = "/", className }) {
  return (
    <Link to={to} className={cn("logo", size === "lg" && "logo--lg", className)} aria-label={`QVFITS by Quivogue, ${to === "/" ? "home" : "dashboard"}`}>
      <img src="/logo/qvfits-logo-stacked.svg" alt="" width="1126" height="1120" className="logo__img" decoding="async" />
      <span className="logo__text" aria-hidden="true">
        <span className="logo__name">QVFITS</span>
        <span className="logo__sub">
          {SUB.map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </span>
    </Link>
  );
}
