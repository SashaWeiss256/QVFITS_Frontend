/* Locale Provider */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { writeStored } from "@/utils/storage";
import { DEFAULT_LANGUAGE, LANGUAGES, languageOf } from "./locales";
import { LANGUAGE_KEY, currentLanguage, setCurrentLanguage } from "./translate";

const LocaleContext = createContext(null);

/**
 * The visitor's language. Changing language sets the translator first, then the state, so
 * the whole page renders again in the new language (SiteLayout keys on it).
 */
export function LocaleProvider({ children }) {
  const [lang, setLang] = useState(() => (LANGUAGES.some((l) => l.code === currentLanguage()) ? currentLanguage() : DEFAULT_LANGUAGE));

  // The page itself speaks the language: screen readers, hyphenation, fonts and direction follow.
  useEffect(() => {
    const l = languageOf(lang);
    document.documentElement.lang = l.code;
    document.documentElement.dir = l.dir;
  }, [lang]);

  const choose = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setCurrentLanguage(code);
    writeStored(LANGUAGE_KEY, code);
    setLang(code);
  }, []);

  const value = useMemo(() => ({ lang, language: languageOf(lang), languages: LANGUAGES, setLang: choose }), [lang, choose]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
