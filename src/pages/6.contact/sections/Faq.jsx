/* FAQ */
import { askVee } from "@/components/assistant/askVee";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/motion/Reveal";
import { useFaq, usePageCopy } from "@/store/tanstackStore/queries/site";

// The questions come from src/data/faq.json: part of the site's code.
export default function Faq() {
  const { data: faq = [] } = useFaq();
  const { data: copy } = usePageCopy("contact");

  return (
    <section className="section section--tight" id="faq">
      <div className="wrap max-w-[800px]">
        <Reveal className="section-head center">
          <span className="kicker">{copy?.faq.kicker}</span>
          <h2>{copy?.faq.title}</h2>
        </Reveal>
        {/* Admin answers are plain text, wrapped in a paragraph for the accordion body. */}
        <Accordion items={faq.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
        {/* Vee Prompt: a fallback for anything the list doesn't cover. */}
        <Reveal className="news center mt-10">
          <span className="kicker">{copy?.vee.kicker}</span>
          <h2 className="text-[1.6rem]">{copy?.vee.title}</h2>
          <p className="lede center">{copy?.vee.text}</p>
          <button type="button" className="btn btn--primary relative z-[1] mt-4" onClick={() => askVee("Hi! I have a question")}>{copy?.vee.cta}</button>
        </Reveal>
      </div>
    </section>
  );
}
