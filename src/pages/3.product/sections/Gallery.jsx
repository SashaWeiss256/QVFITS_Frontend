/* Product Gallery (from Quivogue product.html) */
import { useState } from "react";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";

// The main photo and a thumbnail per view. Only views that exist are shown,
// so there are no empty "photo coming" tiles.
export default function ProductGallery({ product }) {
  const [at, setAt] = useState(0);
  const photos = product.photos;

  return (
    <div className="gallery">
      <div className="gallery__main">
        <Photo key={photos[at]?.id} photo={photos[at]} label={product.name} eager wide />
      </div>
      {photos.length > 1 && (
        <div className="gallery__thumbs">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              className={cn("gallery__thumb", i === at && "is-on")}
              aria-label={`View image ${i + 1} of ${photos.length}`}
              aria-pressed={i === at}
              onClick={() => setAt(i)}
            >
              <Photo photo={photo} label={product.name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
