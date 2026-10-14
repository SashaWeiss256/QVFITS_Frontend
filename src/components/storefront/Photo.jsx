/* Photo (from Quivogue media()) */
import { useState } from "react";

import { cn } from "@/utils/cn";
import { photoSources } from "@/utils/media";

/**
 * A product or campaign photo in Quivogue's `.ph` frame. Until the image
 * loads (or if it is missing) the frame shows the label and "photo coming",
 * so a card always holds its shape.
 */
export default function Photo({ photo, label, eager = false, wide = false, className }) {
  const [state, setState] = useState("loading");
  const src = photo ? photoSources(photo, { wide }) : null;

  return (
    <div className={cn("ph", state === "loaded" && "has-photo", className)}>
      {src && state !== "failed" && (
        <picture>
          {!src.remote && <source type="image/webp" srcSet={src.srcSet} sizes={src.sizes} />}
          <img
            src={src.src}
            srcSet={src.remote ? src.srcSet : undefined}
            sizes={src.remote ? src.sizes : undefined}
            alt={label}
            width={src.width}
            height={src.height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : undefined}
            onLoad={() => setState("loaded")}
            onError={() => setState("failed")}
          />
        </picture>
      )}
      <div className="ph__label">{label}</div>
      <div className="ph__note">photo coming</div>
    </div>
  );
}
