/* Campaign */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";

// One campaign image inside the page width, copy over it. Switched on and
// edited under Website in the admin.
export default function Campaign({ campaign: c }) {
  if (!c?.live) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal as="article" className="campaign">
          <Photo photo={c.photo} label={c.title} wide />
          <div className="campaign__body">
            <span className="kicker">{c.kicker}</span>
            <h2>{c.title}</h2>
            <Link className="btn btn--primary" to={c.href}>{c.cta}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
