/* Fit Assistant (from Quivogue js/assistant.js widget) */
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";

import { assistantGreeting, useAskAssistant } from "@/store/tanstackStore/queries/site";
import AssistantMessage from "./AssistantMessage";
import { AssistantMark } from "./AssistantMark";
import { onAskVee } from "./askVee";

const CHIPS = ["Something for the gym", "What size am I?", "Under 150k", "Build me a kit"];

const bot = (text) => ({ from: "bot", blocks: [{ type: "text", paras: [text] }] });

/**
 * Vee: the round button and the chat panel. Opened by the button, by
 * askVee("…") from any page, and closed with Escape.
 */
export default function FitAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [bot(assistantGreeting())]);
  const [draft, setDraft] = useState("");
  const ask = useAskAssistant();
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

  return (
    <>
      <button type="button" className={`asst-btn ${open ? "is-open" : ""}`} aria-label="Open the Style Assistant" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <AssistantMark />
      </button>

      <section className={`asst ${open ? "is-open" : ""}`} aria-live="polite" aria-label="Style Assistant">
        <header className="asst__head">
          <div className="asst__av"><AssistantMark /></div>
          <div>
            <strong>Vee</strong>
            <span>Your QV fit guide</span>
          </div>
          <button type="button" className="asst__close" aria-label="Close" onClick={() => setOpen(false)}>
            <X className="h-[19px] w-[19px]" aria-hidden="true" />
          </button>
        </header>

        <div className="asst__body" ref={bodyRef}>
          {messages.map((m, i) => <AssistantMessage key={i} message={m} onLeave={() => setOpen(false)} />)}
          {ask.isPending && (
            <div className="msg msg--bot msg--typing"><span className="typing"><i /><i /><i /></span></div>
          )}
        </div>

        {!ask.isPending && (
          <div className="asst__chips">
            {CHIPS.map((c) => <button key={c} type="button" onClick={() => send(c)}>{c}</button>)}
          </div>
        )}

        <div className="asst__foot">
          <form
            className="asst__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
              setDraft("");
            }}
          >
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask me anything…" autoComplete="off" aria-label="Message the Style Assistant" />
            <button className="asst__send" type="submit" aria-label="Send"><ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" /></button>
          </form>
          <p className="asst__note">Answers come from live QV stock. For orders, our team replies on WhatsApp.</p>
        </div>
      </section>
    </>
  );
}
