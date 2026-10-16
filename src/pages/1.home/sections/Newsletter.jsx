/* Newsletter */
import { useState } from "react";

import Reveal from "@/components/motion/Reveal";
import { useOffers, useSubscribe } from "@/store/tanstackStore/queries/site";

// The original centred card. Sign-ups land in the admin's Newsletter list.
// Honest seam: no email goes out until the API connects an email service.
export default function Newsletter({ copy }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const subscribe = useSubscribe();
  const { data: offers } = useOffers();
  if (!copy) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setMsg("That email looks a little off. Mind checking it?");
    try {
      await subscribe.mutateAsync(email);
      setEmail("");
      const sticker = offers?.sticker;
      setMsg(sticker?.live ? `You're on the list. We'll send your ${sticker.tag} code before the next drop.` : "You're on the list. We'll be in touch before the next drop.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <section className="section section--tight" id="newsletter">
      <div className="wrap">
        <Reveal className="news">
          <div className="blob blob--a" style={{ width: 260, height: 260, top: -90, left: -60, opacity: 0.5 }} aria-hidden="true" />
          <div className="relative z-[1]">
            <span className="kicker">{copy.kicker}</span>
            <h2>{copy.title}</h2>
            <p className="lede center">{copy.text}</p>
            <form className="news__form" id="newsForm" noValidate onSubmit={onSubmit}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={copy.placeholder} aria-label="Email address" autoComplete="email" required />
              <button className="btn btn--primary" type="submit" disabled={subscribe.isPending}>{copy.cta}</button>
            </form>
            <p className="news__msg" role="status">{msg}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
