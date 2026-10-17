/* Image Uploader */
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Palette, Trash2 } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";
import { resizeToWebp } from "../lib/media";

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that image"));
    reader.readAsDataURL(blob);
  });

/**
 * Photos for a product, a slide or a tile. Each file is shrunk to a 1200px
 * WebP in the browser first, so a 4 MB phone photo lands at well under
 * 200 KB. Honest seam: until the API stores photos in Spaces, uploads live in
 * this browser only. The first photo is the cover; arrows reorder.
 *
 *   value: Photo[]; onChange(Photo[]); `single` keeps at most one.
 *   colors: [{ id, name, hex }] to tag a photo to a colourway; `productColors`
 *   (ids) are the ones the product lists, shown first on each card; `onColorPick(id)`
 *   tells the caller a colour was picked, so it can add it to the product.
 */
export default function ImageUploader({ value = [], onChange, single = false, colors, onColorPick, productColors, label = null }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Which photo has its colour palette open.
  const [pickingId, setPickingId] = useState(null);

  const add = async (files) => {
    setError("");
    setBusy(true);
    try {
      const added = [];
      for (const file of [...files].slice(0, single ? 1 : 8)) {
        const { blob, width, height } = await resizeToWebp(file, 1200);
        const url = await blobToDataUrl(blob);
        added.push({ id: `upload-${Date.now().toString(36)}-${added.length}`, url, width, height, widths: [], colorId: null });
      }
      onChange(single ? added.slice(0, 1) : [...value, ...added]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const move = (i, by) => {
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item);
    onChange(next);
  };

  return (
    <div>
      {label && <p className="mb-2 text-sm font-semibold text-ink-2">{label}</p>}
      <div className={cn("grid gap-3", single ? "grid-cols-1 sm:max-w-xs" : "grid-cols-2 sm:grid-cols-4")}>
        {value.map((photo, i) => {
          const colour = colors?.find((c) => c.id === photo.colorId);
          const picking = pickingId === photo.id;
          // Colours the product already lists (ticked below); with none ticked yet, every colour is offered.
          const chosen = colors?.filter((c) => productColors?.includes(c.id)) ?? [];
          const setColour = (id) => {
            onChange(value.map((p) => (p.id === photo.id ? { ...p, colorId: id } : p)));
            if (id) onColorPick?.(id);
            setPickingId(null);
          };
          return (
            <figure key={photo.id} className="m-0 flex flex-col overflow-hidden rounded-r-md border border-line bg-white">
              <div className="relative aspect-[3/4]">
                <Photo photo={photo} label={`Photo ${i + 1}`} className="absolute inset-0 h-full rounded-none" />
                {i === 0 && !single && <span className="absolute top-2 left-2 rounded-r-pill bg-white/90 px-2 py-0.5 text-[.7rem] font-semibold">Cover</span>}
                {/* The colour it belongs to, on the photo itself, so a glance shows which is which. */}
                {colour && (
                  <span className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-r-pill bg-white/95 py-1 pr-2.5 pl-1.5 text-xs font-semibold shadow-sh-1">
                    <i className="sw h-4 w-4 ring-1 ring-line" style={{ background: colour.hex }} aria-hidden="true" />
                    {colour.name}
                  </span>
                )}
              </div>
              {/* A band in the colour's own shade under the photo ties the two together. */}
              <figcaption className="grid flex-1 content-start gap-1.5 p-1.5" style={colour ? { borderTop: `4px solid ${colour.hex}` } : undefined}>
                <div className="flex items-center gap-1">
                  {!single && (
                    <>
                      <button type="button" className="icon-btn" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowLeft className="h-4 w-4" /></button>
                      <button type="button" className="icon-btn" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowRight className="h-4 w-4" /></button>
                    </>
                  )}
                  <button type="button" className="icon-btn ml-auto text-warn" aria-label="Remove photo" onClick={() => onChange(value.filter((p) => p.id !== photo.id))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {colors?.length > 0 && (
                  <div className="grid gap-1.5">
                    {/* The colours picked for this product sit right on the card, one tap each. */}
                    <div className="flex flex-wrap items-center gap-1.5 px-0.5" role="group" aria-label="Colour of this photo">
                      {(picking || !chosen.length ? colors : chosen).map((c) => {
                        const on = c.id === photo.colorId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            title={c.name}
                            aria-label={c.name}
                            aria-pressed={on}
                            onClick={() => setColour(on ? null : c.id)}
                            className={cn("grid h-7 w-7 place-items-center rounded-full ring-1 ring-line outline-none transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-400", on && "ring-2 ring-brand-500 ring-offset-2")}
                            style={{ background: c.hex }}
                          >
                            {on && <Check className="h-3.5 w-3.5 text-white mix-blend-difference" aria-hidden="true" />}
                          </button>
                        );
                      })}
                      {chosen.length > 0 && (
                        <button type="button" className="min-h-7 rounded-r-pill px-2 text-xs font-semibold text-ink-3 hover:text-brand-600" aria-expanded={picking} onClick={() => setPickingId(picking ? null : photo.id)}>
                          {picking ? "Fewer" : "More"}
                        </button>
                      )}
                    </div>
                    <p className="m-0 flex min-h-5 items-center gap-1.5 px-0.5 text-xs font-semibold text-ink-3">
                      {colour ? (
                        <>
                          <i className="sw h-3.5 w-3.5 ring-1 ring-line" style={{ background: colour.hex }} aria-hidden="true" /> {colour.name}
                        </>
                      ) : (
                        <>
                          <Palette className="h-3.5 w-3.5 text-ink-4" aria-hidden="true" /> Any colour
                        </>
                      )}
                    </p>
                  </div>
                )}
              </figcaption>
            </figure>
          );
        })}
        {/* Nothing yet: one wide drop zone. Afterwards: a tile at the end of the row, the same shape as the photos. */}
        {(!single || !value.length) && (
          <button
            type="button"
            className={cn(
              "grid place-items-center rounded-r-md border-2 border-dashed border-line-2 bg-cream/60 text-sm text-ink-3 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600",
              value.length ? "min-h-64" : "col-span-full min-h-40 py-8",
            )}
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
            disabled={busy}
          >
            <span className={cn("flex items-center gap-3", value.length ? "flex-col" : "flex-col sm:flex-row")}>
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              <span className="text-center sm:text-left">
                <strong className="block text-sm font-semibold">{busy ? "Resizing…" : single && value.length ? "Replace" : value.length ? "Add more" : "Add photos"}</strong>
                {!value.length && <span className="block text-xs text-ink-4">Click or drop them here. Several at once is fine.</span>}
              </span>
            </span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={!single} className="hidden" onChange={(e) => add(e.target.files)} />
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{error}</p>}
    </div>
  );
}
