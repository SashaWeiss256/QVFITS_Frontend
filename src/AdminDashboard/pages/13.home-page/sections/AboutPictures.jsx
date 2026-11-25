/* About Page Pictures */
import { RotateCcw } from "lucide-react";

import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import Panel from "@/AdminDashboard/components/Panel";

// Each picture on the About page: where it sits, the shoot's photo it replaces, and how it is cut.
const SLOTS = [
  { id: "hero", label: "Opening picture", hint: "Full width behind the headline; wide photos work best.", shoot: "about-1", shape: "landscape", maxWidth: 2000 },
  { id: "home", label: "Story picture 1", hint: "Tall, beside the first paragraphs.", shoot: "about-3", shape: "portrait", maxWidth: 1200 },
  { id: "court", label: "Story picture 2", hint: "Beside the third paragraph.", shoot: "about-2", shape: "portrait", maxWidth: 1200 },
  { id: "pool", label: "Story picture 3", hint: "Wide, under the story.", shoot: "about-4", shape: "landscape", maxWidth: 1600 },
  { id: "showroom", label: "Showroom", hint: "Beside the showroom address and Book a fitting.", shoot: "about", shape: "portrait", maxWidth: 1600 },
];

/**
 * The About page's five pictures. Each shows what the page shows now (an
 * upload, or the shoot's own photo) and can be replaced; "Use the original"
 * puts the shoot's photo back. Saved with the home page document.
 */
export default function AboutPictures({ about = {}, onChange }) {
  const set = (id, photo) => onChange({ ...about, [id]: photo ?? null });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {SLOTS.map((s) => {
        const own = about[s.id];
        return (
          <Panel key={s.id} title={s.label}>
            <p className="m-0 mb-3 text-sm text-ink-3">{s.hint}</p>
            {own ? (
              <ImageUploader single folder="content" shape={s.shape} maxWidth={s.maxWidth} value={[own]} onChange={(photos) => set(s.id, photos[0])} />
            ) : (
              <div className="grid gap-3">
                {/* The shoot's photo, as the page shows it until one is uploaded */}
                <div className={s.shape === "landscape" ? "relative aspect-[16/10] overflow-hidden rounded-[18px] bg-beige" : "relative aspect-[3/4] max-w-xs overflow-hidden rounded-[18px] bg-beige"}>
                  <img src={`/photos/${s.shoot}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  <span className="absolute top-2 left-2 rounded-full bg-cream px-2.5 py-1 text-[.74rem] font-medium">Original photo</span>
                </div>
                <ImageUploader single folder="content" shape={s.shape} maxWidth={s.maxWidth} value={[]} onChange={(photos) => set(s.id, photos[0])} />
              </div>
            )}
            {own && (
              <button type="button" className="btn btn--ghost mt-3 min-h-10 px-4 text-sm" onClick={() => set(s.id, null)}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Use the original
              </button>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
