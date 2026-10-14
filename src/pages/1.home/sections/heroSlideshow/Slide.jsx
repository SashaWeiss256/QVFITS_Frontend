/* Slide */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";

/**
 * One slide: the full-bleed picture, the optional round sticker, and the copy
 * set over it. Only the showing slide is in the tab order and read aloud.
 */
export default function Slide({ slide, index, total, active, lit, mounted }) {
  return (
    <div
      className={cn("slide", active && lit && "is-on")}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={!active || undefined}
    >
      <div className="slide__media">
        {mounted && <Photo photo={slide.photo} label={slide.title} eager={index === 0} wide />}
      </div>
      {slide.sticker && <span className="slide__sticker">{slide.sticker}</span>}
      <div className="slide__body">
        <span className="kicker">{slide.kicker}</span>
        <h2 className="slide__title">{slide.title}</h2>
        <p className="lede">{slide.text}</p>
        <Link className="btn btn--primary btn--lg" to={slide.href} tabIndex={active ? 0 : -1}>
          {slide.cta}
        </Link>
      </div>
    </div>
  );
}
