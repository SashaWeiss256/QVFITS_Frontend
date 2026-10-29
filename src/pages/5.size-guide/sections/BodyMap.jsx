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
const DOT = "before:absolute before:-left-[3px] before:top-[-4.5px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-white before:content-[''] after:absolute after:-right-[3px] after:top-[-4.5px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-white after:content-['']";
const LINE = `absolute h-0 border-t-[1.5px] border-dashed border-white drop-shadow-[0_0_1px_rgb(23_33_31/0.55)] ${DOT}`;

export default function BodyMap() {
  const { data: copy } = usePageCopy("sizeGuide");
  return (
    <Reveal className="flex flex-col items-center">
      {/* The photo's alt text carries the instructions for screen readers; the text below repeats them. */}
      <div className="relative aspect-[700/933] w-[min(100%,420px)] overflow-hidden bg-sand-100">
        <picture>
          <source type="image/webp" srcSet="/photos/collection-lounge-400.webp 400w, /photos/collection-lounge.webp 700w" sizes="(min-width: 900px) 420px, 90vw" />
          <img src="/photos/collection-lounge.jpg" width="700" height="933" className="block h-full w-full object-cover" alt="A model in a fitted set, standing straight. Measure the bust across the fullest part, the waist at the narrowest and the hips at the fullest." loading="lazy" decoding="async" />
        </picture>
        {LINES.map((l) => (
          // A tape line: a dashed hairline with a dot at each end and its name beside it
          <div key={l.label} className={LINE} style={{ top: `${l.y}%`, left: `${l.x1}%`, width: `${l.x2 - l.x1}%` }} aria-hidden="true">
            <span className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap bg-cream px-[9px] py-[3px] text-[0.74rem] font-medium text-ink filter-none">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] w-[min(100%,420px)] text-[.9rem] text-ink-2">
        {copy?.measures.map((m) => <p key={m.name}><strong>{m.name}</strong>: {m.text}</p>)}
      </div>
    </Reveal>
  );
}
