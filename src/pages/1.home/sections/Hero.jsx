/* Hero */
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import HeroSlideshow from "./heroSlideshow/HeroSlideshow";

// The slides' own titles rotate, so the page carries one h1 that does not
// come and go with them: read aloud, never drawn.
export default function Hero() {
  const { data: content } = useHomeContent();

  return (
    <section className="hero">
      <div className="wrap">
        <h1 className="sr-only">QV FITS: seamless activewear, swim and lounge, Kampala</h1>
        {/* The frame holds its height while the slides load, so nothing below jumps */}
        {content ? <HeroSlideshow slides={content.heroSlides} /> : <div className="slideshow" aria-hidden="true" />}
      </div>
    </section>
  );
}
