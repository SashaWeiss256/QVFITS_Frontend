/* Contact Page */
import { PAGES } from "@/seo/shared";
import { useSeo } from "@/seo/useSeo";
import { usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import Channels from "./sections/Channels";
import Faq from "./sections/Faq";
import MessageForm from "./sections/MessageForm";
import { t } from "@/i18n/translate";

/**
 * Client services: how to reach a person, the showroom, a message composer,
 * and the common questions. Every number and address comes from Settings.
 */
export default function ContactPage() {
  const { data: copy } = usePageCopy("contact");
  const { data: s } = useSettings();
  useSeo(PAGES.contact);

  return (
    <>
      {/* Title and the ways to reach us */}
      <section className="wrap pb-24 pt-16 lg:pb-36 lg:pt-24">
        <header className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">{t("Client services")}</p>
            <h1 className="text-[clamp(2.375rem,5.2vw,4.375rem)]">How may we help?</h1>
          </div>
          <p className="max-w-sm text-[1.05rem] leading-relaxed text-ink-2 lg:col-span-4 lg:col-start-9 lg:self-end">{copy?.lede}</p>
        </header>
        <Channels />
      </section>

      {/* The showroom beside the message composer */}
      <section className="bg-beige/60">
        <div className="wrap grid gap-16 py-24 lg:grid-cols-12 lg:py-32">
          {/* Showroom */}
          {s && (
            <div className="lg:col-span-4">
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">The showroom</h2>
              <address className="mt-8 space-y-6 not-italic">
                <p className="font-display text-[1.35rem] leading-snug">
                  {s.address}
                  {s.addressNote && <span className="mt-1 block font-body text-[0.92rem] text-ink-3">{s.addressNote}</span>}
                </p>
                <p className="text-[0.95rem] text-ink-2">Open from {s.opensAt}</p>
                <a className="link-arrow inline-block text-[0.92rem]" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a>
              </address>
            </div>
          )}

          {/* Message */}
          <div className="lg:col-span-7 lg:col-start-6">
            <MessageForm />
          </div>
        </div>
      </section>

      {/* Questions */}
      <Faq />
    </>
  );
}
