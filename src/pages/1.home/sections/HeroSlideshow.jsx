/* Hero Slideshow (from Quivogue index.html, section 1) */
import { cn } from "@/utils/cn";
import Slide from "./Slide";
import { useSlideshow } from "./useSlideshow";

/**
 * A rotating canvas of full-bleed photographs with the copy over the picture.
 * Slides come from the Website module in the admin (useHomeContent). Driven
 * by the dots, the arrow keys, or the 6-second timer.
 */
export default function HeroSlideshow({ slides }) {
  const { at, lit, mounted, go, pause, resume } = useSlideshow(slides.length);
  if (!slides.length) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go(at + 1);
    if (e.key === "ArrowLeft") go(at - 1);
  };

  return (
    <div
      className="slideshow"
      aria-roledescription="carousel"
      aria-label="QV FITS campaigns"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={onKeyDown}
    >
      <div className="slideshow__track">
        {slides.map((s, i) => (
          <Slide key={s.id} slide={s} index={i} total={slides.length} active={i === at} lit={lit} mounted={mounted.has(i)} />
        ))}
      </div>

      {/* Dots */}
      <div className="slideshow__dots" role="tablist" aria-label="Choose a slide">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === at}
            aria-label={s.title}
            className={cn("slideshow__dot", i === at && "is-on")}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
