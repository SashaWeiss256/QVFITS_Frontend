/* Where To Measure */
import Reveal from "@/components/ui/Reveal";

const LINES = [
  { y: 112, x1: 42, x2: 178, color: "var(--brand-400)", label: "BUST" },
  { y: 158, x1: 52, x2: 168, color: "var(--sand-400)", label: "WAIST" },
  { y: 205, x1: 40, x2: 180, color: "var(--brand-400)", label: "HIPS" },
];

export default function BodyMap() {
  return (
    <Reveal className="bodymap">
      <svg viewBox="0 0 220 330" role="img" aria-label="Where to measure: bust across the fullest part, waist at the narrowest, hips at the fullest">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-100)" />
            <stop offset="100%" stopColor="var(--sand-100)" />
          </linearGradient>
        </defs>
        <path
          d="M110 22c11 0 19 9 19 20 0 8-4 14-8 17 14 4 27 12 31 24 5 15 6 32 4 47-1 9-3 18-5 25 3 26 6 52 5 78-1 26-5 52-9 76-1 6-6 9-12 9s-11-4-12-10c-4-23-8-46-13-69-5 23-9 46-13 69-1 6-6 10-12 10s-11-3-12-9c-4-24-8-50-9-76-1-26 2-52 5-78-2-7-4-16-5-25-2-15-1-32 4-47 4-12 17-20 31-24-4-3-8-9-8-17 0-11 8-20 19-20z"
          fill="url(#bodyGrad)"
          stroke="var(--brand-200)"
          strokeWidth="1.5"
        />
        {LINES.map((l) => (
          <g key={l.label}>
            <line x1={l.x1} y1={l.y} x2={l.x2} y2={l.y} stroke={l.color} strokeWidth="1.6" strokeDasharray="5 4" />
            <circle cx={l.x1} cy={l.y} r="3" fill={l.color} />
            <circle cx={l.x2} cy={l.y} r="3" fill={l.color} />
            <text className="lbl" x={l.x1} y={l.y - 8}>{l.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-[18px] max-w-[300px] text-[.9rem] text-ink-2">
        <p><strong>Bust</strong>: around the fullest part, tape level at the back.</p>
        <p><strong>Waist</strong>: the narrowest point, usually just above the belly button.</p>
        <p><strong>Hips</strong>: the fullest part, around 20 cm below your waist.</p>
      </div>
    </Reveal>
  );
}
