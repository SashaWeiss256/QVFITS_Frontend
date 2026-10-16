/* Gallery (from Quivogue product.html) */
import { useRef, useState } from "react";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";

/**
 * Laptop: every view stacked down the page beside the pinned buy panel.
 * Phone and tablet: one view at a time, swiped sideways, with dots. Only
 * views that exist are shown, so there are no empty "photo coming" tiles.
 */
export default function Gallery({ product }) {
  const photos = product.photos;
  const [at, setAt] = useState(0);
  const track = useRef(null);

  const onScroll = () => {
    const el = track.current;
    if (el) setAt(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (i) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });

  return (
    <div className="gallery gallery--stack">
      <div className="gallery__track" ref={track} onScroll={onScroll} aria-label={`${product.name} photos`} role="region">
        {photos.map((photo, i) => (
          <div key={photo.id} className="gallery__slide" aria-label={`Photo ${i + 1} of ${photos.length}`}>
            <Photo photo={photo} label={product.name} eager={i === 0} wide />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="gallery__dots">
          {photos.map((photo, i) => (
            <button key={photo.id} type="button" className={cn("gallery__dot", i === at && "is-on")} aria-label={`Show photo ${i + 1}`} aria-current={i === at} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
