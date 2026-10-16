/* Image Uploader */
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";

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
 *   colors: [{ id, name }] to tag a photo to a colourway.
 */
export default function ImageUploader({ value = [], onChange, single = false, colors, label = "Photos" }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      <p className="mb-2 text-sm font-semibold text-ink-2">{label}</p>
      <div className={cn("grid gap-3", single ? "grid-cols-1 sm:max-w-xs" : "grid-cols-2 sm:grid-cols-4")}>
        {value.map((photo, i) => (
          <figure key={photo.id} className="m-0 overflow-hidden rounded-r-md border border-line bg-white">
            <div className="relative aspect-[3/4]">
              <Photo photo={photo} label={`Photo ${i + 1}`} className="absolute inset-0 h-full rounded-none" />
              {i === 0 && !single && <span className="absolute top-2 left-2 rounded-r-pill bg-white/90 px-2 py-0.5 text-[.7rem] font-semibold">Cover</span>}
            </div>
            <figcaption className="flex items-center gap-1 p-1.5">
              {!single && (
                <>
                  <button type="button" className="icon-btn" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" className="icon-btn" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowRight className="h-4 w-4" /></button>
                </>
              )}
              {colors?.length > 0 && (
                <select
                  className="min-w-0 flex-1 rounded-r-sm border border-line px-1 py-1 text-xs"
                  aria-label="Colourway"
                  value={photo.colorId ?? ""}
                  onChange={(e) => onChange(value.map((p) => (p.id === photo.id ? { ...p, colorId: e.target.value || null } : p)))}
                >
                  <option value="">Any colour</option>
                  {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <button type="button" className="icon-btn ml-auto text-warn" aria-label="Remove photo" onClick={() => onChange(value.filter((p) => p.id !== photo.id))}>
                <Trash2 className="h-4 w-4" />
              </button>
            </figcaption>
          </figure>
        ))}
        {(!single || !value.length) && (
          <button
            type="button"
            className="grid aspect-[3/4] place-items-center rounded-r-md border-2 border-dashed border-line-2 bg-white text-sm text-ink-3 hover:border-brand-300 hover:text-brand-600"
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
            disabled={busy}
          >
            <span className="flex flex-col items-center gap-1.5">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              {busy ? "Resizing…" : single && value.length ? "Replace" : "Add photos"}
            </span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={!single} className="hidden" onChange={(e) => add(e.target.files)} />
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{error}</p>}
    </div>
  );
}
