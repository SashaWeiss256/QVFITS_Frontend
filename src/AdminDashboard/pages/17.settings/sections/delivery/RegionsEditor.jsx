/* Regions And Collection Points */
import Field from "@/components/ui/Field";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Toggle from "@/AdminDashboard/components/Toggle";
import { newPoint, newRegion } from "./regions";

// Money fields: digits only; empty means "use the default" (null).
const money = (v) => (v === "" ? null : Number(v.replace(/\D/g, "")) || 0);

/**
 * The places inside one delivery area and where in each a shopper can
 * collect. A region's fee is what delivering there costs (empty uses the
 * area's fee), so a far region can cost more; a point's fee is what
 * collecting there costs (empty is free).
 */
export default function RegionsEditor({ regions = [], onChange, areaFee, money: show }) {
  return (
    <ListEditor
      items={regions}
      onChange={onChange}
      newItem={newRegion}
      addLabel="Add a region"
      itemLabel={(r, i) => `${r.name || `Region ${i + 1}`}${r.active ? "" : ", hidden"}`}
      render={(r, update) => (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Region name" value={r.name} placeholder="Nakawa" onChange={(e) => update({ name: e.target.value })} />
            <Field label="Delivery fee (UGX)" inputMode="numeric" value={r.fee ?? ""} placeholder={String(areaFee ?? 0)} onChange={(e) => update({ fee: money(e.target.value) })} hint={`Empty uses the area's ${show(areaFee ?? 0)}.`} />
            <Field label="Takes (days)" value={r.etaDays ?? ""} placeholder="Area's" onChange={(e) => update({ etaDays: e.target.value })} />
          </div>
          <Toggle checked={r.active} onChange={(active) => update({ active })} label="Offered at checkout" />

          {/* Collection points in this region */}
          <div className="rounded-[12px] bg-cream-2 p-3">
            <p className="m-0 mb-1 text-sm font-semibold text-ink-2">Collection points in {r.name || "this region"}</p>
            <p className="m-0 mb-3 text-xs text-ink-3">
              {r.points?.length ? "Shoppers here can choose delivery or collecting from one of these." : "None yet: shoppers here get delivery only."}
            </p>
            <ListEditor
              items={r.points ?? []}
              onChange={(points) => update({ points })}
              newItem={newPoint}
              addLabel="Add a collection point"
              itemLabel={(p, i) => `${p.name || `Point ${i + 1}`}${p.active ? "" : ", hidden"}`}
              render={(p, set) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={p.name} placeholder="Ntinda Complex, Shop 14" onChange={(e) => set({ name: e.target.value })} />
                  <Field label="Phone (optional)" inputMode="tel" value={p.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} />
                  <Field className="sm:col-span-2" label="Address" value={p.address} placeholder="Plot 5, Ntinda Road, ground floor" onChange={(e) => set({ address: e.target.value })} />
                  <Field label="Opening hours" value={p.hours ?? ""} placeholder="Mon to Sat, 9am to 7pm" onChange={(e) => set({ hours: e.target.value })} />
                  <Field label="Map link (optional)" type="url" value={p.mapUrl ?? ""} placeholder="https://maps.google.com/…" onChange={(e) => set({ mapUrl: e.target.value })} />
                  <Field label="Collection fee (UGX)" inputMode="numeric" value={p.fee ?? ""} placeholder="0" onChange={(e) => set({ fee: money(e.target.value) })} hint="Empty is free." />
                  <Field label="Ready in" value={p.etaDays ?? ""} placeholder="Same day" onChange={(e) => set({ etaDays: e.target.value })} />
                  <Toggle className="sm:col-span-2" checked={p.active} onChange={(active) => set({ active })} label="Offered at checkout" />
                </div>
              )}
            />
          </div>
        </div>
      )}
    />
  );
}
