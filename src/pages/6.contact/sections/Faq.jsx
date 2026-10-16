/* FAQ */
import { askVee } from "@/components/assistant/askVee";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import { useHomeContent } from "@/store/tanstackStore/queries/site";

// The questions are edited under Website in the admin.
export default function Faq() {
  const { data: content } = useHomeContent();

  return (
    <section className="section section--tight" id="faq">
      <div className="wrap max-w-[800px]">
        <Reveal className="section-head center">
          <span className="kicker">Common questions</span>
          <h2>FAQ</h2>
        </Reveal>
        <Accordion items={(content?.faq ?? []).map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
        <Reveal className="news center mt-10">
          <span className="kicker">Still stuck?</span>
          <h2 className="text-[1.6rem]">Ask Vee</h2>
          <p className="lede center">She knows every piece, every size and what&apos;s actually in stock right now.</p>
          <button type="button" className="btn btn--primary relative z-[1] mt-4" onClick={() => askVee("Hi! I have a question")}>Open the Style Assistant</button>
        </Reveal>
      </div>
    </section>
  );
}
