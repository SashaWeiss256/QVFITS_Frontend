/* Delivery Form (step 2) */
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import InfoCard from "@/components/storefront/InfoCard";
import SubHeading from "@/components/storefront/SubHeading";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useNewsletterConsent } from "@/store/tanstackStore/queries/site";
import { deliveryChoice, pointsOf, regionOf, regionsOf, zoneEta, zoneFee } from "@/utils/delivery";
import { cn } from "@/utils/cn";
import { deliverySchema } from "../schemas";
import { t } from "@/i18n/translate";

function Err({ error }) {
  return error ? <p role="alert" className="m-0 mt-1 text-xs font-semibold text-warn">{error.message}</p> : null;
}

/**
 * Where it's going and how to pay. Prefilled from a signed-in account and
 * from the last order on this device. Reports where it is going as it
 * changes (the area, its region, delivery or a collection point), so the
 * summary beside it stays honest. An area with regions asks for one; a region
 * with collection points offers delivery or collecting from one of them.
 */
export default function DeliveryForm({ defaults, settings, methods, subtotal, onChoice, onSubmit, onBack }) {
  const { money } = useCurrency();
  const zones = settings.zones ?? [];
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(deliverySchema(zones, methods)),
    defaultValues: { zoneRegion: "", fulfilment: "delivery", collectionPoint: "", ...defaults },
  });
  const [region, zoneRegion, fulfilment, collectionPoint] = useWatch({ control, name: ["region", "zoneRegion", "fulfilment", "collectionPoint"] });
  const zone = zones.find((z) => z.id === region);
  const regions = regionsOf(zone);
  const area = regionOf(zone, zoneRegion);
  const points = pointsOf(area);
  const choice = deliveryChoice(settings, { region, zoneRegion, fulfilment, collectionPoint });
  const collect = choice.collect;
  const { data: consent } = useNewsletterConsent();
  const regionField = register("region");
  const zoneRegionField = register("zoneRegion");

  // A saved region or point that is no longer offered is dropped, and so is "collect" where there are no points.
  useEffect(() => {
    if (zoneRegion && !area) setValue("zoneRegion", "");
    if (fulfilment === "collect" && !points.length) setValue("fulfilment", "delivery");
    if (collectionPoint && !points.some((p) => p.id === collectionPoint)) setValue("collectionPoint", "");
  }, [zoneRegion, area, fulfilment, points, collectionPoint, setValue]);

  // The page prices and summarises from this.
  useEffect(() => {
    onChoice?.({ region, zoneRegion: zoneRegion || undefined, fulfilment: points.length ? fulfilment : "delivery", collectionPoint: fulfilment === "collect" ? collectionPoint || undefined : undefined });
  }, [region, zoneRegion, fulfilment, collectionPoint, points.length, onChoice]);

  return (
    <InfoCard as="form" id="deliveryForm" noValidate onSubmit={handleSubmit(onSubmit)}>
      <SubHeading>Where&apos;s it going?</SubHeading>
      <div className="field">
        <label htmlFor="oName">{t("Your name")}</label>
        <input id="oName" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        <Err error={errors.name} />
      </div>
      <div className="field">
        <label htmlFor="oPhone">{t("Phone number")}</label>
        <input id="oPhone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        <Err error={errors.phone} />
      </div>
      <div className="field">
        <label htmlFor="oEmail">Email for your receipt (optional)</label>
        <input id="oEmail" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        <Err error={errors.email} />
      </div>
      <div className="field">
        <label htmlFor="oRegion">{t("Delivery area")}</label>
        <select id="oRegion" {...regionField} onChange={(e) => { regionField.onChange(e); setValue("zoneRegion", ""); setValue("collectionPoint", ""); setValue("fulfilment", "delivery"); }}>
          {zones.map((z) => {
            const fee = zoneFee(z, subtotal, settings);
            const eta = zoneEta(z);
            return <option key={z.id} value={z.id}>{z.name}: {fee ? money(fee) : "free"}{eta ? `, ${eta.toLowerCase()}` : ""}</option>;
          })}
        </select>
        {zone && <p className="m-0 mt-1 text-xs text-ink-3">{[zoneEta(regions.length ? choice : zone), zone.description].filter(Boolean).join(". ")}</p>}
      </div>
      {/* Region: only when the area is split into regions */}
      {regions.length > 0 && (
        <div className="field">
          <label htmlFor="oZoneRegion">Region in {zone.name}</label>
          <select id="oZoneRegion" aria-invalid={Boolean(errors.zoneRegion)} {...zoneRegionField} onChange={(e) => { zoneRegionField.onChange(e); setValue("collectionPoint", ""); }}>
            <option value="" disabled>Choose your region</option>
            {regions.map((r) => {
              const fee = zoneFee({ zone, area: r, point: null }, subtotal, settings);
              return <option key={r.id} value={r.id}>{r.name}: {fee ? money(fee) : "free delivery"}{r.points?.some((p) => p.active !== false) ? ", or collect" : ""}</option>;
            })}
          </select>
          <Err error={errors.zoneRegion} />
        </div>
      )}
      {/* Deliver or collect: only when the region has collection points */}
      {points.length > 0 && (
        <fieldset className="field min-w-0 border-0 p-0">
          <legend className="mb-1.5 text-[.8rem] font-medium text-ink-3">How would you like it?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: "delivery", label: "Deliver to me" }, { id: "collect", label: "Collect it myself" }].map((o) => (
              <label key={o.id} className={cn("check-row justify-center border px-4 py-2 transition-colors", fulfilment === o.id ? "border-ink bg-ink text-cream" : "border-line-2 bg-white hover:border-ink-3")}>
                <input type="radio" value={o.id} className="sr-only" {...register("fulfilment")} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {/* Collection points in the region */}
      {points.length > 0 && fulfilment === "collect" && (
        <fieldset className="field min-w-0 border-0 p-0">
          <legend className="mb-1.5 text-[.8rem] font-medium text-ink-3">Where will you collect it?</legend>
          <div className="grid gap-2">
            {points.map((p) => {
              const fee = zoneFee({ zone, area, point: p }, subtotal, settings);
              return (
                <label key={p.id} className="check-row items-start border border-line-2 bg-white px-4 py-3 transition-colors hover:border-ink-3">
                  <input type="radio" value={p.id} className="mt-1" {...register("collectionPoint")} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span>{p.name}</span>
                      <span className="text-xs font-normal text-ink-3">{fee ? money(fee) : "Free"}{p.etaDays ? ` · ready ${p.etaDays.toLowerCase()}` : ""}</span>
                    </span>
                    <span className="block text-xs font-normal text-ink-3">{p.address}{p.hours ? ` · ${p.hours}` : ""}</span>
                    {p.mapUrl && <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-normal text-brand-600 underline underline-offset-2">Open in Maps</a>}
                  </span>
                </label>
              );
            })}
            <Err error={errors.collectionPoint} />
          </div>
        </fieldset>
      )}
      {!collect && (
        <div className="field">
          <label htmlFor="oAddr">Where should we drop it?</label>
          <textarea id="oAddr" rows={3} placeholder="Area, road, any landmark that helps" aria-invalid={Boolean(errors.address)} {...register("address")} />
          <Err error={errors.address} />
        </div>
      )}
      <fieldset className="field min-w-0 border-0 p-0">
        <legend className="mb-1.5 text-[.8rem] font-medium text-ink-3">How you&apos;d like to pay</legend>
        <div className="grid gap-2">
          {methods.map((p) => (
            <label key={p.id} className="check-row border border-line-2 bg-white px-4 py-2 transition-colors hover:border-ink-3">
              <input type="radio" value={p.id} {...register("payment")} />
              <span>{p.label}{p.instructions && <span className="block text-xs font-normal text-ink-3">{p.instructions}</span>}</span>
            </label>
          ))}
          <Err error={errors.payment} />
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="oNote">Anything we should know? (optional)</label>
        <textarea id="oNote" rows={2} placeholder="Gift wrap, a specific delivery time…" {...register("note")} />
      </div>
      {/* Never ticked for them: joining the newsletter is its own choice (double opt-in follows). */}
      <div className="field">
        <label className="check-row items-start">
          <input type="checkbox" className="mt-1" {...register("news")} />
          <span className="text-sm font-normal">
            Send me news of drops and offers (needs your email)
            {consent && <span className="block text-xs text-ink-3">{consent}</span>}
          </span>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button type="submit" className="btn btn--primary">{t("Review order")}</button>
        <button type="button" className="btn btn--ghost" onClick={onBack}>{t("Back to bag")}</button>
      </div>
    </InfoCard>
  );
}
