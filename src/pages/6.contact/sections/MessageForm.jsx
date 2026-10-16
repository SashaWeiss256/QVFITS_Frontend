/* Send A Message */
import { useState } from "react";

import Reveal from "@/components/ui/Reveal";
import { notify } from "@/store/tanstackStore/notices";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

const TOPICS = ["A specific piece", "Sizing help", "Delivery", "An exchange", "Styling for an event", "Something else"];

// Composes the message, then hands it to the channel the visitor picks. No
// mail server yet, so the form never claims to have sent anything itself.
export default function MessageForm() {
  const { data: s } = useSettings();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [body, setBody] = useState("");
  const [composed, setComposed] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return setError("Pop your name and a message in first.");
    setError("");
    setComposed(`Hi QV FITS! I'm ${name.trim()}. (${topic})\n\n${body.trim()}`);
  };

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
      <h2 className="sub-h mb-1">Send a message</h2>
      <p className="text-[.9rem] text-ink-3">Fill this in and it opens a ready-to-send message. You pick where it goes.</p>
      <form noValidate className="mt-4" onSubmit={submit}>
        <div className="field">
          <label htmlFor="cName">Your name</label>
          <input id="cName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="cTopic">What&apos;s it about?</label>
          <select id="cTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cMsg">Your message</label>
          <textarea id="cMsg" rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi QV FITS! I was looking at…" required />
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-warn">{error}</p>}
        <button className="btn btn--primary btn--block mt-4" type="submit">Compose message</button>
      </form>
      {composed && s && (
        <div className="mt-4 text-center" role="status">
          <p className="news__msg">Your message is ready. Send it wherever suits you:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <a className="btn btn--soft" href={whatsappLink(s.whatsapp, composed)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
            {s.email && <a className="btn btn--soft" href={`mailto:${s.email}?subject=${encodeURIComponent(`${topic}: ${name}`)}&body=${encodeURIComponent(composed)}`}>Send by email</a>}
            <a className="btn btn--soft" href={s.instagram} target="_blank" rel="noopener noreferrer" onClick={copy}>Open Instagram DM</a>
            <button className="btn btn--soft" type="button" onClick={copy}>Copy message</button>
          </div>
        </div>
      )}
    </Reveal>
  );
}
