/* Locale Provider */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { readStored, writeStored } from "@/utils/storage";
import { DEFAULT_LANGUAGE, LANGUAGES, languageOf } from "./locales";
import { LANGUAGE_KEY, currentLanguage, setCurrentLanguage } from "./translate";

const LocaleContext = createContext(null);
const WELCOME_KEY = "qvfits:welcome";

/**
 * The visitor's language, and whether the first visit welcome has been
 * answered. Changing language sets the translator first, then the state, so
 * the whole page renders again in the new language (SiteLayout keys on it).
 */
export function LocaleProvider({ children }) {
  const [lang, setLang] = useState(() => (LANGUAGES.some((l) => l.code === currentLanguage()) ? currentLanguage() : DEFAULT_LANGUAGE));
  const [welcomed, setWelcomed] = useState(() => Boolean(readStored(WELCOME_KEY, false)));

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

  const finishWelcome = useCallback(() => {
    writeStored(WELCOME_KEY, true);
    setWelcomed(true);
  }, []);

  const value = useMemo(() => ({ lang, language: languageOf(lang), languages: LANGUAGES, setLang: choose, welcomed, finishWelcome }), [lang, choose, welcomed, finishWelcome]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
