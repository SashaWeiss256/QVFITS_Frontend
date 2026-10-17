/* Newsletter */
import Reveal from "@/components/motion/Reveal";
import NewsletterForm from "@/components/storefront/NewsletterForm";

// The original centred card. Joining is double opt-in: the address is on the
// list once the emailed link is opened (NewsletterForm).
export default function Newsletter({ copy }) {
  if (!copy) return null;

  return (
    <section className="section section--tight" id="newsletter">
      <div className="wrap">
        <Reveal className="news">
          <div className="blob blob--a" style={{ width: 260, height: 260, top: -90, left: -60, opacity: 0.5 }} aria-hidden="true" />
          <div className="relative z-[1]">
            <span className="kicker">{copy.kicker}</span>
            <h2>{copy.title}</h2>
            <p className="lede center">{copy.text}</p>
            <NewsletterForm source="home" formId="newsForm" placeholder={copy.placeholder} cta={copy.cta} className="mx-auto max-w-[520px]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
