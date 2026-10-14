/* Campaign Banner */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import Reveal from "@/components/ui/Reveal";
import { useHomeContent } from "@/store/tanstackStore/queries/site";

// The one big campaign image, edited under Website in the admin.
export default function Campaign() {
  const { data: content } = useHomeContent();
  const c = content?.campaign;
  if (!c?.live) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal as="article" className="campaign">
          <Photo photo={c.photo} label={c.title} wide />
          <div className="campaign__body">
            <span className="kicker">{c.kicker}</span>
            <h2>{c.title}</h2>
            {c.text && <p>{c.text}</p>}
            <Link className="btn btn--primary" to={c.href}>{c.cta}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
