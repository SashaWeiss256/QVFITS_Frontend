/* Delivery Form (step 2) */
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrency } from "@/store/context/CurrencyContext";
import { deliverySchema, PAYMENTS } from "./checkoutSchema";

function Err({ error }) {
  return error ? <p role="alert" className="m-0 mt-1 text-xs font-semibold text-warn">{error.message}</p> : null;
}

/**
 * Where it's going and how to pay. Prefilled from a signed-in account and
 * from the last order on this device. Reports the region as it changes, so
 * the summary beside it stays honest.
 */
export default function DeliveryForm({ defaults, settings, onRegion, onSubmit, onBack }) {
  const { money } = useCurrency();
  const { register, handleSubmit, control, formState: { errors } } = useForm({ resolver: zodResolver(deliverySchema), defaultValues: defaults });
  const region = useWatch({ control, name: "region" });
  const regionField = register("region");

  return (
    <form id="deliveryForm" className="info-card" noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2 className="sub-h">Where&apos;s it going?</h2>
      <div className="field">
        <label htmlFor="oName">Your name</label>
        <input id="oName" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        <Err error={errors.name} />
      </div>
      <div className="field">
        <label htmlFor="oPhone">Phone number</label>
        <input id="oPhone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
        <Err error={errors.phone} />
      </div>
      <div className="field">
        <label htmlFor="oEmail">Email for your receipt (optional)</label>
        <input id="oEmail" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        <Err error={errors.email} />
      </div>
      <div className="field">
        <label htmlFor="oRegion">Delivery area</label>
        <select id="oRegion" {...regionField} onChange={(e) => { regionField.onChange(e); onRegion(e.target.value); }}>
          <option value="kampala">Kampala: {money(settings.kampalaDelivery)}</option>
          <option value="upcountry">Upcountry: {money(settings.upcountryDelivery)}</option>
          <option value="pickup">I&apos;ll collect from the showroom: free</option>
        </select>
      </div>
      {region !== "pickup" && (
        <div className="field">
          <label htmlFor="oAddr">Where should we drop it?</label>
          <textarea id="oAddr" rows={3} placeholder="Area, road, any landmark that helps" aria-invalid={Boolean(errors.address)} {...register("address")} />
          <Err error={errors.address} />
        </div>
      )}
      <fieldset className="field m-0 border-0 p-0">
        <legend className="mb-1.5 text-[.8rem] font-medium text-ink-3">How you&apos;d like to pay</legend>
        <div className="grid gap-2">
          {PAYMENTS.map((p) => (
            <label key={p.id} className="check-row rounded-r-md border border-line bg-white px-3">
              <input type="radio" value={p.id} {...register("payment")} />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="oNote">Anything we should know? (optional)</label>
        <textarea id="oNote" rows={2} placeholder="Gift wrap, a specific delivery time…" {...register("note")} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button type="submit" className="btn btn--primary">Review order</button>
        <button type="button" className="btn btn--ghost" onClick={onBack}>Back to bag</button>
      </div>
    </form>
  );
}
