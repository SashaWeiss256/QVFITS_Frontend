/* Questions */
import { askVee } from "@/components/assistant/askVee";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/motion/Reveal";
import { useFaq, usePageCopy } from "@/store/tanstackStore/queries/site";

// The shop's own questions and answers, with Vee offered for anything else.
export default function Faq() {
  const { data: faq = [] } = useFaq();
  const { data: copy } = usePageCopy("contact");
  if (!faq.length) return null;

  return (
    <section className="section border-t border-line" id="faq">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        {/* Heading and Vee */}
        <Reveal className="lg:col-span-4">
          <h2>Questions, answered</h2>
          <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-ink-3">{copy?.vee.text}</p>
          <button type="button" className="link-arrow mt-6 text-[0.92rem]" onClick={() => askVee("Hi! I have a question")}>{copy?.vee.cta}</button>
        </Reveal>

        {/* Answers */}
        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion items={faq.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
        </div>
      </div>
    </section>
  );
}
