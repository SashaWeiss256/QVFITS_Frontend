/* Legal Document */
import { Link } from "react-router-dom";

import PageIntro from "@/components/layout/PageIntro";
import PageLoader from "@/components/ui/PageLoader";
import { useSettings } from "@/store/tanstackStore/queries/site";
import Blocks from "./Blocks";

const OTHERS = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of sale" },
  { to: "/returns", label: "Exchanges and returns" },
  { to: "/delivery", label: "Delivery" },
];

/**
 * One policy page: the intro, a contents list, the numbered sections, and
 * links to the other policies. `build(settings)` returns the document, so the
 * shop's details and fees always match what the admin has set.
 */
export default function LegalDocument({ path, build }) {
  const { data: settings } = useSettings();
  if (!settings) return <PageLoader />;
  const doc = build(settings);

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
              {OTHERS.filter((o) => o.to !== path).map((o) => (
                <Link key={o.to} to={o.to} className="btn btn--ghost">{o.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageIntro>
  );
}
