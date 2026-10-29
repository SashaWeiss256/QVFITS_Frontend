/* Languages */

// The languages the shop speaks. Each is shown in its own script, so a
// visitor can find theirs without reading English. Arabic runs right to left.
export const LANGUAGES = [
  { code: "en", native: "English", name: "English", dir: "ltr", intl: "en" },
  { code: "sw", native: "Kiswahili", name: "Swahili", dir: "ltr", intl: "sw" },
  { code: "fr", native: "Français", name: "French", dir: "ltr", intl: "fr" },
  { code: "ar", native: "العربية", name: "Arabic", dir: "rtl", intl: "ar" },
  { code: "zh", native: "中文", name: "Chinese", dir: "ltr", intl: "zh-Hans" },
];

export const DEFAULT_LANGUAGE = "en";
export const languageOf = (code) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
