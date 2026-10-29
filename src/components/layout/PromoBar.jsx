/* Announcement Bar */
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOffers, useSettings } from "@/store/tanstackStore/queries/site";

/**
 * The thin gradient strip above the header. Every message is on the strip at
 * once, spread across its width, and the whole row drifts from left to right
 * without stopping (it never pauses under the mouse). Two copies of the row,
 * each at least as wide as the screen, slide one row to the right and start
 * over unseen, so there is never a gap. With reduced motion switched on, the
 * row simply sits still. Messages come from Offers in the admin, with
 * {{freeShipping}} and {{phone}} filled in.
 */
export default function PromoBar() {
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const { money } = useCurrency();

  const lines = (offers?.promoBar ?? [])
    .map((line) => line.replace("{{freeShipping}}", settings ? money(settings.freeShippingOver) : "").replace("{{phone}}", settings?.phone ?? ""))
    .filter((line) => line.trim());
  if (!lines.length) return null;

  const seconds = Math.max(26, lines.length * 9);
  const row = (
    <ul className="m-0 flex min-w-[100vw] shrink-0 list-none items-center justify-center gap-14 p-0 px-7">
      {lines.map((line, i) => (
        <li key={i} className="flex items-center gap-14 whitespace-nowrap">
          <span>{line}</span>
          <i className="block h-1 w-1 rotate-45 bg-cream/70" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative z-61 flex h-9 items-center overflow-hidden bg-[image:var(--brand-grad)] text-[0.78rem] tracking-[0.02em] text-cream" role="region" aria-label="Announcements">
      <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
        <div className="flex w-max animate-promo-slide items-center will-change-transform motion-reduce:transform-none motion-reduce:animate-none" style={{ "--promo-time": `${seconds}s` }} aria-hidden="true">
          {row}
          {row}
        </div>
      </div>
      <p className="sr-only">{lines.join(". ")}</p>
    </div>
  );
}
