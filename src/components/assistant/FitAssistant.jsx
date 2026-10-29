/* Fit Assistant (from Quivogue js/assistant.js widget) */
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";

import { assistantGreeting, forgetAssistant, useAskAssistant, useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import AssistantMessage from "./AssistantMessage";
import { AssistantMark } from "./AssistantMark";
import { onAskVee } from "./askVee";
import { t } from "@/i18n/translate";

const bot = (text) => ({ from: "bot", blocks: [{ type: "text", paras: [text] }] });

/**
 * Vee: the round button and the chat panel. Opened by the button, by
 * askVee("…") from any page, and closed with Escape. Her name, greeting,
 * starter questions and on/off switch are set in the dashboard (Vee).
 */
export default function FitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const ask = useAskAssistant();
  const { data: settings } = useSettings();
  const vee = settings?.assistant;
  const chips = vee?.chips ?? [];
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const sendRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, ask.isPending]);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 320);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // askVee("…") from any page opens the panel and sends the question.
  useEffect(
    () =>
      onAskVee((question) => {
        setOpen(true);
        if (question) setTimeout(() => sendRef.current?.(question), 250);
      }),
    [],
  );

  const send = async (text) => {
    if (!text.trim() || ask.isPending) return;
    setMessages((m) => [...m, { from: "me", text }]);
    try {
      const blocks = await ask.mutateAsync(text);
      setMessages((m) => [...m, { from: "bot", blocks }]);
    } catch {
      setMessages((m) => [...m, bot("Something went wrong on my side. The team can help on WhatsApp.")]);
    }
  };

  useEffect(() => {
    sendRef.current = send;
  });

  if (vee && vee.enabled === false) return null;

  // Her greeting leads the chat; it follows the dashboard's words until she knows the shopper's name.
  const thread = [bot(assistantGreeting(vee?.greeting)), ...messages];
  // The starter buttons show until a reply brings its own quick replies.
  const last = thread[thread.length - 1];
  const ownChips = last.blocks?.some((b) => b.type === "chips");

  const name = vee?.name || "Vee";
  const CHIP = "min-h-9 border border-ink/20 px-3.5 text-[0.82rem] text-ink-2 transition-colors hover:border-ink hover:text-ink";

  return (
    <>
      {/* Launcher: a round button on a phone, a square label with its name from a tablet up */}
      <button
        type="button"
        className={cn(
          "fixed bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--addbar,0px))] right-4 z-[70] inline-flex h-12 w-12 items-center justify-center gap-2.5 bg-ink max-sm:rounded-full text-[0.88rem] text-cream shadow-sh-3 transition-all duration-500 ease-q hover:bg-brand-600",
          "sm:right-5 sm:w-auto sm:pl-4 sm:pr-5 lg:bottom-5",
          open && "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-label="Open the Style Assistant"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <AssistantMark />
        <span className="max-sm:sr-only">Ask {name}</span>
      </button>

      {/* Panel: a full sheet on a phone, a tall card on a laptop */}
      <section
        className={cn(
          "fixed inset-0 z-[90] flex flex-col bg-cream text-ink transition-all duration-500 ease-q sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(700px,calc(100svh-40px))] sm:w-[420px] sm:shadow-sh-4",
          open ? "translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-6 opacity-0",
        )}
        aria-live="polite"
        aria-label="Style Assistant"
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-line px-6 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-cream"><AssistantMark /></span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[1.25rem] leading-none">{name}</p>
            <p className="mt-1 text-[0.8rem] text-ink-3">Your QVFITS stylist</p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center text-ink-3 hover:text-ink" aria-label={t("Close")} onClick={() => setOpen(false)}>
            <X className="h-[19px] w-[19px]" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        {/* Thread */}
        <div data-lenis-prevent className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6 [&>*]:shrink-0" ref={bodyRef}>
          {thread.map((m, i) => <AssistantMessage key={i} message={m} onLeave={() => setOpen(false)} onAsk={send} isLast={i === thread.length - 1 && !ask.isPending} />)}
          {ask.isPending && (
            <div className="flex gap-1 self-start py-2" aria-label="Typing">
              {[0, 1, 2].map((d) => <i key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-3" style={{ animationDelay: `${d * 160}ms` }} />)}
            </div>
          )}
        </div>

        {/* Starter questions */}
        {!ask.isPending && !ownChips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 pb-4">
            {chips.map((c) => <button key={c} type="button" className={CHIP} onClick={() => send(c)}>{c}</button>)}
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-line px-6 pb-5 pt-4">
          <form
            className="flex items-center border-b border-ink/30 focus-within:border-ink"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
              setDraft("");
            }}
          >
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about fit, fabric or a look" autoComplete="off" aria-label="Message the Style Assistant" className="min-h-12 min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-ink-4" />
            <button className="grid h-10 w-10 place-items-center text-ink hover:text-brand-600" type="submit" aria-label="Send"><ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" /></button>
          </form>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
            Answers come from live QVFITS stock. For orders, our team replies on WhatsApp.{" "}
            <button type="button" className="underline underline-offset-2 hover:text-ink" onClick={() => { forgetAssistant(); setMessages((m) => [...m, bot("Done. I have forgotten your name, size and budget.")]); }}>Forget me</button>
          </p>
        </div>
      </section>
    </>
  );
}
