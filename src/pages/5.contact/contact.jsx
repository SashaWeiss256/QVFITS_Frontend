/* Contact Page (port of Quivogue contact.html) */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import ContactInfo from "./sections/ContactInfo";
import Faq from "./sections/Faq";
import MessageForm from "./sections/MessageForm";

export default function ContactPage() {
  useSeo({ title: "Contact & FAQ", description: "Visit QV FITS at THE CUBE, G17 Kisementi, Kampala. Fit, fabric, delivery and exchange questions answered." });
  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          <p className="crumbs"><Link to="/">Home</Link> / Contact &amp; FAQ</p>
          <div className="section-head center">
            <span className="kicker">Get in touch</span>
            <h1>Come see us, or just ask</h1>
            <p className="lede">The fastest answer is a WhatsApp. For anything about fit, fabric or what is in stock, Vee in the corner knows every piece.</p>
          </div>
          <div className="contact-grid">
            <ContactInfo />
            <MessageForm />
          </div>
        </div>
      </section>
      <Faq />
    </>
  );
}
