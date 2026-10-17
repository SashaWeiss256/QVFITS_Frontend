/* Search */

// Lower case, no accents, punctuation as spaces: "Cross-Back Sports Bra" and "cross back sports bra" read the same.
const plain = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// A plural worn down to its singular, so "leggings" finds "legging" and "bras" finds "bra".
const singular = (word) => {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("es") && /(ch|sh|x|ss|z)es$/.test(word)) return word.slice(0, -2);
  return word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
};

/**
 * Whether some text matches what a person typed. Every word typed must start
 * a word in the text (so "sports bra" finds the Cross-Back Sports Bra, in any
 * order, and "legg" finds "Leggings"), plural or singular, ignoring capitals,
 * accents and punctuation. A word of three letters or fewer has to be a whole
 * word, so "bra" finds bras but not "brand". An empty search matches everything.
 * One matcher for every search box on the shop and in the dashboard.
 */
export function matchesSearch(text, query) {
  const words = plain(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = plain(text).split(" ");
  return words.every((w) => {
    const one = singular(w);
    if (w.length <= 3) return hay.some((h) => h === w || h === `${w}s` || h === `${w}es`);
    return hay.some((h) => h.startsWith(w) || h.startsWith(one));
  });
}
