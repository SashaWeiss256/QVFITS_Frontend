/* The Showroom: Book A Fitting */
import Reveal from "@/components/motion/Reveal";
import Photo from "@/components/storefront/Photo";
import { useHomeContent, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

/**
 * An invitation, the way a house offers an appointment: the showroom photo
 * on one side; on the other the address, the opening time, and a button that
 * opens WhatsApp with a fitting request already written. Every fact comes
 * from Settings. Used on the home page and the About page.
 */
export default function Showroom() {
  const { data: s } = useSettings();
  const { data: content } = useHomeContent();
  if (!s) return null;
  const request = "Hi QVFITS, I'd like to book a fitting at the showroom. I train in: ";

  return (
    <section className="grid bg-ink text-cream lg:grid-cols-2">
      {/* Photo */}
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:min-h-[86vh]">
        <Photo photo={content?.aboutPhoto} label="Inside the QVFITS showroom" wide />
      </div>

      {/* Invitation */}
      <Reveal className="flex flex-col justify-center px-[clamp(20px,6vw,104px)] py-12 sm:py-20 lg:py-28">
        <p className="kicker kicker--light">The showroom</p>
        <h2 className="max-w-md text-[clamp(2.4rem,4.4vw,4rem)] leading-[1.04] text-cream">Come and be fitted.</h2>
        <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-cream/75">
          Tell us what you train in and we will have pieces waiting in your size. Move in them, take your time, and leave only with what is right.
        </p>

        {/* Where and when */}
        <dl className="mt-12 grid max-w-md grid-cols-2 gap-8 border-t border-cream/15 pt-8 text-[0.92rem]">
          <div>
            <dt className="text-cream/50">Find us</dt>
            <dd className="mt-2 leading-relaxed">
              {s.address}
              {s.addressNote && <span className="block text-cream/60">{s.addressNote}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-cream/50">Open</dt>
            <dd className="mt-2">From {s.opensAt}</dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-x-8">
          <a className="btn btn--light btn--lg text-center" href={whatsappLink(s.whatsapp, request)} target="_blank" rel="noopener noreferrer">Book a fitting</a>
          <a className="link-arrow text-[0.92rem] text-cream self-center sm:self-auto" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a>
        </div>
      </Reveal>
    </section>
  );
}
