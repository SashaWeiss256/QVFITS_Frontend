/* Logo */
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * The Quivogue (QVFITS) logo as on the original Quivogue site: the supplied
 * artwork (wave mark, QV FITS under it, EST. 2023) on the left; on the right
 * QVFITS large in Anton with the brand gradient, and QUIVOGUE small beneath
 * it, spread to exactly the width of QVFITS. The words are live text so they
 * stay sharp at header size (docs/04-design-system.md, Logo).
 *
 * tone="dark" is for dark grounds (the header over the hero, the footer):
 * the white artwork and cream words.
 */
const SUB = "QUIVOGUE".split("");

export default function Logo({ size = "md", to = "/", className, tone = "light" }) {
  const dark = tone === "dark";
  const lg = size === "lg";

  return (
    <Link
      to={to}
      className={cn("inline-flex shrink-0 items-center gap-2.5 sm:gap-3", className)}
      aria-label={`Quivogue (QVFITS), ${to === "/" ? "home" : "dashboard"}`}
    >
      {/* Artwork: the wave with QV FITS and EST. 2023 under it */}
      <img
        src={dark ? "/logo/qvfits-logo-stacked-white.svg" : "/logo/qvfits-logo-stacked.svg"}
        alt=""
        width="1126"
        height="1120"
        decoding="async"
        className={cn("block w-auto transition-[height] duration-500", lg ? "h-[68px]" : "h-[40px] lg:h-[46px]")}
      />

      {/* Names: QVFITS over QUIVOGUE, the same width */}
      <span className="inline-flex flex-col" style={{ lineHeight: 1 }} aria-hidden="true">
        <span
          style={{ lineHeight: 1 }}
          className={cn(
            "font-logo leading-none tracking-[0.12em] mr-[-0.12em]",
            lg ? "text-[1.75rem]" : "text-[1.15rem] lg:text-[1.3rem]",
            dark ? "text-cream" : "bg-[image:var(--brand-grad)] bg-clip-text text-transparent",
          )}
        >
          QVFITS
        </span>
        <span
          style={{ lineHeight: 1 }}
          className={cn(
            "mt-1 flex justify-between font-medium leading-none",
            lg ? "text-[0.72rem]" : "text-[0.55rem] lg:text-[0.6rem]",
            dark ? "text-cream/75" : "text-ink-3",
          )}
        >
          {SUB.map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </span>
    </Link>
  );
}
