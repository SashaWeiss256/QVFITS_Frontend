/* Contact Page (port of Quivogue contact.html) */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import { usePageCopy } from "@/store/tanstackStore/queries/site";
import Details from "./sections/Details";
import Faq from "./sections/Faq";
import MessageForm from "./sections/MessageForm";

export default function ContactPage() {
  const { data: copy } = usePageCopy("contact");
  useSeo({ title: "Contact & FAQ", description: "Visit QVFITS at THE CUBE, G17 Kisementi, Kampala. Fit, fabric, delivery and exchange questions answered." });
  return (
    <>
      {/* Keep store details beside the message composer on wide screens. */}
      <section className="section section--tight">
        <div className="wrap">
          <p className="crumbs"><Link to="/">Home</Link> / Contact &amp; FAQ</p>
          <div className="section-head center">
            <span className="kicker">{copy?.kicker}</span>
            <h1>{copy?.title}</h1>
            <p className="lede">{copy?.lede}</p>
          </div>
          <div className="contact-grid">
            <Details />
            <MessageForm />
          </div>
        </div>
      </section>
      {/* FAQs are shared with the admin-managed website content. */}
      <Faq />
    </>
  );
}
