/* Legal */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useSeo } from "@/seo/useSeo";
import PageLoader from "@/components/ui/PageLoader";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { LEGAL_DOCS, legalDoc } from "./content";
import Blocks from "./sections/Blocks";
import { t } from "@/i18n/translate";

/**
 * /privacy, /terms, /returns and /delivery, laid out like a client services
 * booklet. A left rail lists the four policies (the open one marked) and this
 * policy's sections, with the section being read underlined as you scroll.
 * The document itself sits in a calm reading column. The text lives in
 * ./content and takes the shop's live details from Settings.
 */
export default function LegalPage() {
  const { pathname: path } = useLocation();
  const { data: settings } = useSettings();
  const doc = settings ? legalDoc(path).build(settings) : null;
  const [active, setActive] = useState(null);
  useSeo({ title: doc?.title, description: doc?.lede });

  // Underline the section being read.
  useEffect(() => {
    if (!doc) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // Sections change only with the policy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, !!doc]);

  if (!doc) return <PageLoader variant="text" />;

  return (
    <div className="wrap pb-24 pt-16 lg:pb-32 lg:pt-24">
      {/* Title */}
      <header className="mb-14 max-w-3xl border-b border-line pb-12 lg:mb-20 lg:pb-16">
        <p className="kicker">{t("Client services")}</p>
        <h1 className="text-[clamp(2.375rem,5.2vw,4.375rem)]">{doc.title}</h1>
        <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-ink-2">{doc.lede}</p>
        <p className="mt-6 text-[0.85rem] text-ink-3">Last updated {doc.updated}</p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-24">
        {/* Rail: the policies, then this one's sections */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav aria-label={t("Policies")} className="mb-10">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:flex-col lg:gap-1">
              {LEGAL_DOCS.map((o) => (
                <li key={o.path}>
                  <Link
                    to={o.path}
                    aria-current={o.path === path ? "page" : undefined}
                    className={cn("block py-1.5 font-display text-[1.15rem] transition-colors", o.path === path ? "text-ink" : "text-ink-4 hover:text-ink")}
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* On this page: hidden on phones, where the document is short to scroll */}
          <nav aria-label="On this page" className="hidden border-t border-line pt-6 lg:block">
            <p className="mb-3 text-[0.8rem] text-ink-3">On this page</p>
            <ol className="flex flex-col">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      "block py-1.5 text-[0.88rem] leading-snug transition-colors",
                      active === s.id ? "text-brand-600 underline decoration-brand-600 underline-offset-4" : "text-ink-3 hover:text-ink",
                    )}
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* Document: numbered clauses, since legal sections are referred to by number */}
        <article className="min-w-0 max-w-[68ch]">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mb-14 scroll-mt-32 grid grid-cols-[minmax(0,1fr)] gap-x-8 sm:grid-cols-[3rem_minmax(0,1fr)]">
              <span className="font-display text-[1.4rem] leading-none text-brand-600" aria-hidden="true">{i + 1}</span>
              <div>
                <h2 className="mb-5 text-[clamp(1.4rem,2.2vw,1.8rem)] leading-tight">{s.heading}</h2>
                <Blocks blocks={s.blocks} />
              </div>
            </section>
          ))}

          {/* Still unsure: a person, not a form */}
          <div className="mt-20 border border-line bg-sand-100 px-8 py-12 sm:px-12">
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">A question we have not answered?</h2>
            <p className="mt-3 max-w-md text-ink-2">Our team reads every message. WhatsApp is the quickest way to reach us.</p>
            <Link to="/contact" className="btn btn--primary mt-8">Contact client services</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
