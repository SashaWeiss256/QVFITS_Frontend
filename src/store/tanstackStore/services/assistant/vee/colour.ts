/* Vee: Colour Engine */

/**
 * Colour theory for outfits, as plain scored rules (no AI). Each colour is
 * read from its hex into lightness, chroma and hue (OKLCH), classed as a
 * neutral, an earth tone or an accent, and pairs are scored from that. The
 * team can override any pair in the dashboard (Vee, Pairing rules): an
 * "always" or a "never" there beats the rules.
 */

export interface Swatch {
  id: string;
  name: string;
  hex: string;
}

/** A pair of colour ids the team has ruled on. */
export interface Pairing {
  good: [string, string][];
  avoid: [string, string][];
}

export type Role = "neutral" | "earth" | "accent";

export interface Tone {
  swatch: Swatch;
  /** Lightness 0 (black) to 1 (white), chroma, and hue in degrees. */
  l: number;
  /** OKLab axes, for a true distance between two colours. */
  a: number;
  b: number;
  c: number;
  h: number;
  role: Role;
  /** A strong colour that should lead an outfit on its own. */
  loud: boolean;
  warm: boolean;
}

export type Mood = "tonal" | "neutral" | "pop" | "contrast";

export interface Harmony {
  /** 0 clash to 1 made for each other. */
  score: number;
  /** A pairing safe to show a shopper. */
  ok: boolean;
  reason: string;
}

// sRGB hex to OKLCH (Björn Ottosson's OKLab matrices).
function oklch(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, a: A, b: B, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** What a colour is, from its hex. */
export function toneOf(swatch: Swatch): Tone {
  const { l, a, b, c, h } = oklch(swatch.hex);
  // Very dark, very light or barely coloured: black, white, ivory, cream, grey, slate, espresso, and deep navy or forest, which behave as neutrals.
  const neutral = c < 0.045 || l < 0.3 || l > 0.93 || (l < 0.4 && c < 0.1);
  // Soft browns and tans read as earth: they sit with most things without being plain.
  const earth = !neutral && c < 0.1 && h > 35 && h < 100;
  return {
    swatch,
    l,
    a,
    b,
    c,
    h,
    role: neutral ? "neutral" : earth ? "earth" : "accent",
    loud: !neutral && !earth && c > 0.125,
    // Reds, oranges and yellows are warm; greens, blues and purples are cool.
    warm: h < 110 || h > 340,
  };
}

const key = (a: string, b: string) => [a, b].sort().join("|");
const pairSet = (pairs: [string, string][]) => new Set(pairs.map(([a, b]) => key(a, b)));

/** How well two colours sit together, and why in a short phrase. */
export function harmony(a: Tone, b: Tone, rules?: Pairing): Harmony {
  const [x, y] = [a.swatch.name, b.swatch.name];
  // The team's word first.
  if (rules?.avoid && pairSet(rules.avoid).has(key(a.swatch.id, b.swatch.id))) return { score: 0, ok: false, reason: `${x} and ${y} are not paired by the team` };
  if (rules?.good && pairSet(rules.good).has(key(a.swatch.id, b.swatch.id))) return { score: 1, ok: true, reason: `${x} with ${y} is a team favourite` };
  if (a.swatch.id === b.swatch.id) return { score: 0.85, ok: true, reason: `Head to toe ${x.toLowerCase()}` };

  const dL = Math.abs(a.l - b.l);
  const dH = hueGap(a.h, b.h);
  // The real distance between the two colours in OKLab.
  const dist = Math.hypot(dL, a.a - b.a, a.b - b.b);

  // Two shades so close they look like a mistake (ivory and cream).
  if (dist < 0.06) return { score: 0.3, ok: false, reason: `${x} and ${y} are almost the same, so they read as a mismatch` };

  if (a.role === "neutral" || b.role === "neutral") {
    const [quiet, lead] = a.role === "neutral" ? [x, y] : [y, x];
    return { score: 0.92, ok: true, reason: a.role === b.role ? `${x} and ${y} keep it calm` : `${quiet} lets the ${lead.toLowerCase()} lead` };
  }
  // Two colours from one family, clearly different in depth: tonal.
  if (dH < 28 && dL > 0.1) return { score: 0.82, ok: true, reason: `${x} and ${y} sit in the same family` };
  // Neighbouring hues at the same depth fight each other.
  if (dH < 45 && dL <= 0.1) return { score: 0.35, ok: false, reason: `${x} and ${y} are close but not matching` };
  // One loud colour leads; anything loud beside another accent that isn't tonal competes with it.
  if ((a.loud && b.role === "accent") || (b.loud && a.role === "accent")) return { score: 0.38, ok: false, reason: `${x} and ${y} compete for attention` };
  // Earth tones are forgiving beside most accents.
  if ((a.role === "earth") !== (b.role === "earth") && !(a.loud && b.loud)) return { score: 0.7, ok: true, reason: `${a.role === "earth" ? x : y} grounds the ${a.role === "earth" ? y : x}` };
  // Warm against cool without a neutral between: the classic clash.
  if (a.warm !== b.warm) return { score: 0.3, ok: false, reason: `${x} and ${y} pull in opposite directions` };
  // Two loud colours fight for the eye.
  if (a.loud && b.loud) return { score: 0.25, ok: false, reason: `${x} and ${y} are both loud` };
  return { score: 0.62, ok: true, reason: `${x} and ${y} sit together well enough` };
}

export interface OutfitColour {
  /** 0 to 1, the weakest pairing pulling it down. */
  score: number;
  ok: boolean;
  mood: Mood;
  reason: string;
}

/** Every pair in an outfit must work; one loud colour at most. */
export function outfitColour(tones: Tone[], rules?: Pairing): OutfitColour {
  const pairs: Harmony[] = [];
  for (let i = 0; i < tones.length; i++) for (let j = i + 1; j < tones.length; j++) pairs.push(harmony(tones[i], tones[j], rules));
  const weakest = pairs.reduce((m, p) => (p.score < m.score ? p : m), pairs[0] ?? { score: 1, ok: true, reason: "" });
  const loud = tones.filter((t) => t.loud).length;
  const accents = tones.filter((t) => t.role === "accent").length;
  const neutrals = tones.filter((t) => t.role === "neutral").length;
  const sameFamily = tones.every((t) => t.role !== "neutral" && hueGap(t.h, tones[0].h) < 28) || new Set(tones.map((t) => t.swatch.id)).size === 1;
  const mood: Mood = sameFamily ? "tonal" : accents === 0 ? "neutral" : accents === 1 && neutrals >= 1 ? "pop" : "contrast";
  const best = pairs.reduce((m, p) => (p.score > m.score ? p : m), pairs[0] ?? weakest);
  const avg = pairs.length ? pairs.reduce((s, p) => s + p.score, 0) / pairs.length : 1;
  const score = Math.max(0, Math.min(weakest.score, avg) - (loud > 1 ? 0.3 : 0));
  return { score, ok: weakest.ok && loud <= 1 && score >= 0.55, mood, reason: pairs.length > 1 && mood === "pop" ? best.reason : (weakest.ok ? best.reason : weakest.reason) };
}
