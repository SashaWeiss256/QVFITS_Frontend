/* Logo */
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * The QVFITS logo in the client's format: the supplied artwork (wave mark,
 * QVFITS under it, EST. 2023) on the left, and QVFITS over the brand name
 * QUIVOGUE on the right. One piece of artwork, so the
 * parts always keep their spacing (docs/04-design-system.md, Logo).
 */
export default function Logo({ size = "md", to = "/", className }) {
  return (
    <Link to={to} className={cn("logo", size === "lg" && "logo--lg", className)} aria-label={`QVFITS by Quivogue, ${to === "/" ? "home" : "dashboard"}`}>
      <img src="/logo/qvfits-logo.svg" alt="" width="2573" height="1120" className="logo__img" decoding="async" />
    </Link>
  );
}
