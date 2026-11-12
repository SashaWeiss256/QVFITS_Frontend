/* Translate */
import { readStored } from "@/utils/storage";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./locales";
import { TABLE } from "./strings";

export const LANGUAGE_KEY = "qvfits:language";

// One dictionary per language, built once from the table in strings.js: the
// English sentence is the key, so a sentence nobody has translated yet simply
// stays English and nothing breaks.
const COLUMN = { sw: 1, fr: 2, ar: 3, zh: 4 };
const DICTIONARIES = Object.fromEntries(
  Object.entries(COLUMN).map(([code, i]) => [code, Object.fromEntries(TABLE.filter((row) => row[i]).map((row) => [row[0], row[i]]))]),
);

const stored = readStored(LANGUAGE_KEY, DEFAULT_LANGUAGE);
let current = LANGUAGES.some((l) => l.code === stored) ? stored : DEFAULT_LANGUAGE;

export const currentLanguage = () => current;
// Set before the page re-renders, so every `t()` in that render already speaks the new language.
export const setCurrentLanguage = (code) => {
  current = code;
};

/**
 * Words the visitor reads, in the language they picked.
 *   t("Add to bag")
 *   t("Prices in {code}", { code: "USD" })
 * Anything the shop's staff typed in the admin (product names, offers, page
 * text) is shown as entered; only the shop's own interface is translated here.
 */
export function t(text, vars) {
  const out = DICTIONARIES[current]?.[text] ?? text;
  return vars ? out.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? "")) : out;
}
