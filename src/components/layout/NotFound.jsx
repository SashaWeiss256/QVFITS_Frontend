/* Not Found (from Quivogue 404.html) */
import { Link } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";

export default function NotFound() {
  // Served with status 200 by the SPA fallback, so keep it out of search.
  useSeo({ title: "Page not found", noindex: true });
  return (
    <section className="wrap section center">
      <p className="kicker">404</p>
      <h1>We couldn&apos;t find that page</h1>
      <p className="lede">It may have moved, or the link may be old. The whole range is one tap away.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className="btn btn--primary">Shop the range</Link>
        <Link to="/" className="btn btn--ghost">Back home</Link>
      </div>
    </section>
  );
}
