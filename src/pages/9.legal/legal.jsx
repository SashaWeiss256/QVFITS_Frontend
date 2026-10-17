/* Legal */
import { Link, useLocation } from "react-router-dom";

import PageIntro from "@/components/layout/PageIntro";
import PageLoader from "@/components/ui/PageLoader";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { LEGAL_DOCS, legalDoc } from "./content";
import Blocks from "./sections/Blocks";

/**
 * /privacy, /terms, /returns and /delivery: the intro, a contents list, the
 * numbered sections, and links to the other policies. The policy comes from
 * the URL; the text lives in ./content.
 */
export default function LegalPage() {
  const { pathname: path } = useLocation();
  const { data: settings } = useSettings();
  if (!settings) return <PageLoader variant="text" />;
  // Build the page from the path-specific policy and live business settings (e.g. contact details).
  const doc = legalDoc(path).build(settings);

  return (
    <PageIntro kicker="Policies" title={doc.title} lede={doc.lede}>
      <p className="eyebrow">Last updated {doc.updated}</p>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Contents */}
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-2">On this page</p>
          <ol className="m-0 flex list-none flex-col p-0">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex min-h-11 items-center text-[.92rem] text-ink-2 hover:text-brand-600">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-[72ch]">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mb-10 scroll-mt-28">
              <h2 className="mb-3 text-[clamp(1.25rem,2.2vw,1.6rem)]">{i + 1}. {s.heading}</h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <div className="border-t border-line pt-6">
            <p className="eyebrow mb-2">Other policies</p>
            <div className="flex flex-wrap gap-2">
              {LEGAL_DOCS.filter((o) => o.path !== path).map((o) => (
                <Link key={o.path} to={o.path} className="btn btn--ghost">{o.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageIntro>
  );
}
