/* Language Picker */
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useLocale } from "@/i18n/LocaleProvider";
import { t } from "@/i18n/translate";
import { useClickOutside } from "@/utils/useClickOutside";
import { cn } from "@/utils/cn";

// Footer control beside the currency; opens upward. Each language is named in its own script.
export default function LanguagePicker() {
  const { lang, language, languages, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button type="button" className="inline-flex min-h-11 items-center gap-1.5 text-[0.85rem]" aria-haspopup="listbox" aria-expanded={open} aria-label={`${t("Language")}: ${language.native}`} onClick={() => setOpen((o) => !o)}>
        <span>{language.native}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div className="absolute bottom-full end-0 z-20 mb-2 w-48 max-w-[calc(100vw-2rem)] border border-line bg-cream p-2 text-ink shadow-sh-3" role="listbox" hidden={!open}>
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            role="option"
            lang={l.code}
            aria-selected={l.code === lang}
            className={cn("flex min-h-10 w-full items-center px-3 text-start text-[0.9rem] transition-colors", l.code === lang ? "font-medium" : "text-ink-3 hover:text-ink")}
            onClick={() => {
              setLang(l.code);
              setOpen(false);
            }}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}
