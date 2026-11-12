/* Send A Message */
import { useState } from "react";

import { notify } from "@/store/tanstackStore/notices";
import { usePageCopy, useSendMessage, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";
import { t } from "@/i18n/translate";

// Composes the message and keeps a copy in the admin's Messages inbox, then
// hands it to the channel the visitor picks. No mail server yet, so the form
// never claims an email went out.
export default function MessageForm() {
  const { data: s } = useSettings();
  const { data: words } = usePageCopy("contact");
  const send = useSendMessage();
  const topics = words?.topics ?? [];
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [composed, setComposed] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return setError("Pop your name and a message in first.");
    setError("");
    const about = topic || topics[0];
    setComposed(`Hi QVFITS! I'm ${name.trim()}. (${about})\n\n${body.trim()}`);
    // The inbox copy is a bonus: if it fails, the hand-off below still works.
    send.mutate({ name: name.trim(), topic: about, message: body.trim() });
  };

  // Instagram can't prefill a DM, so its button copies the message for pasting.
  // Clipboard access can be refused, so fall back to asking for a manual copy.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(composed);
      notify("Message copied", { tone: "success" });
    } catch {
      notify("Select and copy the message manually");
    }
  };

  const LABEL = "mb-1 block text-[0.82rem] text-ink-3";
  const INPUT = "w-full border-0 border-b border-ink/25 bg-transparent py-3 text-[1rem] outline-none transition-colors focus:border-ink";

  return (
    <div>
      {/* Heading */}
      <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">{words?.form.title}</h2>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-3">{words?.form.text}</p>

      {/* Form */}
      <form noValidate className="mt-10 grid gap-8 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label htmlFor="cName" className={LABEL}>{t("Your name")}</label>
          <input id="cName" className={INPUT} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="cTopic" className={LABEL}>About</label>
          <select id="cTopic" className={`${INPUT} cursor-pointer`} value={topic || topics[0] || ""} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cMsg" className={LABEL}>Your message</label>
          <textarea id="cMsg" rows={4} className={`${INPUT} resize-none`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="I was looking at…" required />
        </div>
        {error && <p role="alert" className="text-[0.9rem] text-warn sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button className="btn btn--primary btn--lg" type="submit">Write my message</button>
        </div>
      </form>

      {/* Send Options: shown once the message is composed and the shop's contacts have loaded */}
      {composed && s && (
        <div className="mt-10 border-t border-line pt-8" role="status">
          <p className="font-display text-[1.3rem]">Your message is ready. Where shall we send it?</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="btn btn--primary" href={whatsappLink(s.whatsapp, composed)} target="_blank" rel="noopener noreferrer">{t("Send on WhatsApp")}</a>
            {/* Email only when the shop has an address on file. */}
            {s.email && <a className="btn btn--ghost" href={`mailto:${s.email}?subject=${encodeURIComponent(`${topic || topics[0]}: ${name}`)}&body=${encodeURIComponent(composed)}`}>Send by email</a>}
            <a className="btn btn--ghost" href={s.instagram} target="_blank" rel="noopener noreferrer" onClick={copy}>Open Instagram</a>
            <button className="btn btn--ghost" type="button" onClick={copy}>Copy message</button>
          </div>
        </div>
      )}
    </div>
  );
}
