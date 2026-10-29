/* Where To Measure */
import Reveal from "@/components/motion/Reveal";
import { usePageCopy } from "@/store/tanstackStore/queries/site";

// The measuring lines, as a share of the photo: where each sits down the body
// and across it. They are laid to the studio portrait below, so they stay
// with the figure at any size.
const LINES = [
  { label: "Bust", y: 31, x1: 30, x2: 66 },
  { label: "Waist", y: 41.5, x1: 34, x2: 63 },
  { label: "Hips", y: 50, x1: 30, x2: 67 },
];

/**
 * Where to measure, shown on a real studio portrait from the range with the
 * three tape lines drawn across the body, then the words for each beneath.
 */
export default function BodyMap() {
  const { data: copy } = usePageCopy("sizeGuide");
  return (
    <Reveal className="bodymap">
      {/* The photo's alt text carries the instructions for screen readers; the text below repeats them. */}
      <div className="bodymap__photo">
        <picture>
          <source type="image/webp" srcSet="/photos/collection-lounge-400.webp 400w, /photos/collection-lounge.webp 700w" sizes="(min-width: 900px) 420px, 90vw" />
          <img src="/photos/collection-lounge.jpg" width="700" height="933" alt="A model in a fitted set, standing straight. Measure the bust across the fullest part, the waist at the narrowest and the hips at the fullest." loading="lazy" decoding="async" />
        </picture>
        {LINES.map((l) => (
          <div key={l.label} className="bodymap__line" style={{ top: `${l.y}%`, left: `${l.x1}%`, width: `${l.x2 - l.x1}%` }} aria-hidden="true">
            <span className="bodymap__tag">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] w-[min(100%,420px)] text-[.9rem] text-ink-2">
        {copy?.measures.map((m) => <p key={m.name}><strong>{m.name}</strong>: {m.text}</p>)}
      </div>
    </Reveal>
  );
}
