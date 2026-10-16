/* Send A Message */
import { useState } from "react";

import Reveal from "@/components/motion/Reveal";
import { notify } from "@/store/tanstackStore/notices";
import { usePageCopy, useSendMessage, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

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

  return (
    <Reveal className="info-card">
      <h2 className="sub-h mb-1">{words?.form.title}</h2>
      <p className="text-[.9rem] text-ink-3">{words?.form.text}</p>
      <form noValidate className="mt-4" onSubmit={submit}>
        <div className="field">
          <label htmlFor="cName">Your name</label>
          <input id="cName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="cTopic">What&apos;s it about?</label>
          <select id="cTopic" value={topic || topics[0] || ""} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cMsg">Your message</label>
          <textarea id="cMsg" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi QVFITS! I was looking at…" required />
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-warn">{error}</p>}
        <button className="btn btn--primary btn--block mt-4" type="submit">Compose message</button>
      </form>
      {/* Send Options: shown once the message is composed and the shop's contacts have loaded. */}
      {composed && s && (
        <div className="mt-4 text-center" role="status">
          <p className="news__msg">Your message is ready. Send it wherever suits you:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <a className="btn btn--soft" href={whatsappLink(s.whatsapp, composed)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
            {/* Email only when the shop has an address on file. */}
            {s.email && <a className="btn btn--soft" href={`mailto:${s.email}?subject=${encodeURIComponent(`${topic || topics[0]}: ${name}`)}&body=${encodeURIComponent(composed)}`}>Send by email</a>}
            <a className="btn btn--soft" href={s.instagram} target="_blank" rel="noopener noreferrer" onClick={copy}>Open Instagram DM</a>
            <button className="btn btn--soft" type="button" onClick={copy}>Copy message</button>
          </div>
        </div>
      )}
    </Reveal>
  );
}
