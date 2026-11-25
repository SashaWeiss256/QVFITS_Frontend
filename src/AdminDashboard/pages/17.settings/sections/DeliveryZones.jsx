/* Delivery Zones */
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { shippingResource, useCollection } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";
import RegionsEditor from "./delivery/RegionsEditor";
import { newPoint, newRegion, regionsProblem } from "./delivery/regions";

// A new zone starts free, with no delivery time, offered at checkout, and delivered rather than collected.
const BLANK = { name: "", description: "", fee: 0, freeOver: null, etaDays: "", active: true, collect: false, regions: [] };

// "4 regions · 3 collection points", for the list.
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const pointCount = (z) => (z.regions ?? []).reduce((n, r) => n + (r.points?.length ?? 0), 0);

/**
 * Where the shop delivers and what each place costs. Checkout lists the
 * active ones. An area can hold regions (each priced by how far it is) and
 * each region its collection points; an area without regions works as one
 * place, as before.
 */
export default function DeliveryZones({ canEdit, shopFreeOver }) {
  const zones = useCollection(shippingResource);
  const { moneyBase } = useCurrency();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  // Moving a legacy "collected from the showroom" area into a region as a collection point.
  const [moving, setMoving] = useState(null);
  const problem = editing ? regionsProblem(editing.regions) : "";
  const legacy = zones.items.filter((z) => z.collect && z.active);
  const targets = zones.items.filter((z) => !z.collect);

  // Saving either adds the zone or updates the one being edited.
  const save = async () => {
    if (problem) return;
    if (editing.id) await zones.update(editing.id, editing);
    else await zones.create(editing);
    setEditing(null);
  };

  const moveShowroom = async () => {
    const { from, zoneId, regionId, address } = moving;
    const zone = zones.items.find((z) => z.id === zoneId);
    const point = { ...newPoint(), name: from.name, address, fee: from.fee || null, etaDays: from.etaDays ?? "" };
    const regions = zone.regions ?? [];
    const next = regionId === "new"
      ? [...regions, { ...newRegion(), name: "Central", points: [point] }]
      : regions.map((r) => (r.id === regionId ? { ...r, points: [...(r.points ?? []), point] } : r));
    await zones.update(zone.id, { ...zone, regions: next });
    await zones.update(from.id, { ...from, active: false });
    setMoving(null);
  };

  {/* Delivery Zones: each with its fee, its free-delivery level and how long it takes */}
  return (
    <Panel title="Delivery zones">
      {/* The old showroom area: offer to make it a collection point inside a region */}
      {canEdit && legacy.length > 0 && targets.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-cream-2 p-4 text-sm">
          <MapPin className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <p className="m-0 min-w-0 flex-1 text-ink-2">
            <strong>{legacy[0].name}</strong> is its own delivery area. Make it a collection point inside a region, so shoppers there can choose it beside delivery.
          </p>
          <Button variant="soft" onClick={() => setMoving({ from: legacy[0], zoneId: targets[0].id, regionId: targets[0].regions?.[0]?.id ?? "new", address: "" })}>Move it</Button>
        </div>
      )}
      <div className="mb-3 flex justify-end">{canEdit && <Button variant="soft" onClick={() => setEditing(BLANK)}><Plus className="h-4 w-4" /> Add zone</Button>}</div>
      {/* Zone List: a collection zone shows no free-over level, since there is nothing to deliver */}
      <ul className="m-0 list-none p-0">
        {zones.items.map((z) => (
          <li key={z.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0 flex-1">
              <strong>{z.name}</strong>
              <p className="m-0 text-sm text-ink-3">
                {z.fee ? moneyBase(z.fee) : "Free"}{z.collect ? " · collection" : ` · free over ${moneyBase(z.freeOver ?? shopFreeOver)}`}{z.etaDays && ` · ${z.etaDays} days`}
                {z.regions?.length > 0 && ` · ${plural(z.regions.length, "region")} · ${plural(pointCount(z), "collection point")}`}
              </p>
            </div>
            <StatusChip status={z.active ? "active" : "inactive"} />
            {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => setEditing(z)}>Edit</button>}
            {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => setRemoving(z)}>Delete</button>}
          </li>
        ))}
      </ul>
      {/* Zone Form */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${editing.name}` : "New delivery zone"}
        size={editing?.collect ? "sm" : "lg"}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {problem && <p role="alert" className="m-0 mr-auto text-sm text-warn">{problem}</p>}
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={zones.isSaving} disabled={!editing?.name.trim() || Boolean(problem)}>Save</Button>
          </div>
        }
      >
        {editing && (
          <div className="grid gap-4">
            <Field label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Entebbe" />
            <Field label="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} hint="How it gets there, shown on the delivery policy." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fee (UGX)" inputMode="numeric" value={editing.fee} onChange={(e) => setEditing({ ...editing, fee: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
              <Field label="Free over (UGX)" inputMode="numeric" value={editing.freeOver ?? ""} placeholder={String(shopFreeOver)} onChange={(e) => setEditing({ ...editing, freeOver: e.target.value === "" ? null : Number(e.target.value.replace(/\D/g, "")) || 0 })} hint="Empty uses the shop-wide amount." />
              <Field label="Takes (days)" value={editing.etaDays} onChange={(e) => setEditing({ ...editing, etaDays: e.target.value })} placeholder="1 to 2" />
            </div>
            <Toggle checked={editing.collect} onChange={(collect) => setEditing({ ...editing, collect })} label="Collected from the showroom" hint="No address is asked for." />
            <Toggle checked={editing.active} onChange={(active) => setEditing({ ...editing, active })} label="Offered at checkout" />
            {/* Regions: a collection-only area has nothing to split */}
            {!editing.collect && (
              <section className="grid gap-3 border-t border-line pt-4">
                <div>
                  <h3 className="m-0 text-base">Regions and collection points</h3>
                  <p className="m-0 mt-1 text-sm text-ink-3">
                    Split {editing.name || "this area"} into regions when the fee depends on how far it is. Shoppers pick their region at checkout, then delivery or a collection point in it. With no regions, the whole area costs {moneyBase(editing.fee)}.
                  </p>
                </div>
                <RegionsEditor regions={editing.regions ?? []} onChange={(regions) => setEditing({ ...editing, regions })} areaFee={editing.fee} money={moneyBase} />
              </section>
            )}
          </div>
        )}
      </Modal>
      {/* Move the showroom area into a region as a collection point */}
      <Modal
        isOpen={Boolean(moving)}
        onClose={() => setMoving(null)}
        title={moving ? `Move ${moving.from.name}` : ""}
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setMoving(null)}>Cancel</Button><Button onClick={() => moveShowroom()} loading={zones.isSaving} disabled={!moving?.address.trim()}>Move</Button></div>}
      >
        {moving && (() => {
          const zone = zones.items.find((z) => z.id === moving.zoneId);
          return (
            <div className="grid gap-4">
              <p className="m-0 text-sm text-ink-3">It becomes a collection point in the region you pick, and the old area is switched off (kept, so past orders still show its name).</p>
              <Field label="Delivery area" options={targets.map((z) => ({ value: z.id, label: z.name }))} value={moving.zoneId} onChange={(e) => setMoving({ ...moving, zoneId: e.target.value, regionId: targets.find((z) => z.id === e.target.value)?.regions?.[0]?.id ?? "new" })} />
              <Field label="Region" options={[...(zone?.regions ?? []).map((r) => ({ value: r.id, label: r.name })), { value: "new", label: "A new region named Central" }]} value={moving.regionId} onChange={(e) => setMoving({ ...moving, regionId: e.target.value })} />
              <Field label="Showroom address" value={moving.address} placeholder="Plot 5, Kampala Road" onChange={(e) => setMoving({ ...moving, address: e.target.value })} />
            </div>
          );
        })()}
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.name} loading={zones.isRemoving} onConfirm={() => zones.remove(removing.id).then(() => setRemoving(null))} />
    </Panel>
  );
}
