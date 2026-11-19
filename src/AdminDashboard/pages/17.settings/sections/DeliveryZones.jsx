/* Delivery Zones */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { shippingResource, useCollection } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";

// A new zone starts free, with no delivery time, offered at checkout, and delivered rather than collected.
const BLANK = { name: "", description: "", fee: 0, freeOver: null, etaDays: "", active: true, collect: false };

/** Where the shop delivers and what each place costs. Checkout lists the active ones. */
export default function DeliveryZones({ canEdit, shopFreeOver }) {
  const zones = useCollection(shippingResource);
  const { moneyBase } = useCurrency();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  // Saving either adds the zone or updates the one being edited.
  const save = async () => {
    if (editing.id) await zones.update(editing.id, editing);
    else await zones.create(editing);
    setEditing(null);
  };

  {/* Delivery Zones: each with its fee, its free-delivery level and how long it takes */}
  return (
    <Panel title="Delivery zones">
      <div className="mb-3 flex justify-end">{canEdit && <Button variant="soft" onClick={() => setEditing(BLANK)}><Plus className="h-4 w-4" /> Add zone</Button>}</div>
      {/* Zone List: a collection zone shows no free-over level, since there is nothing to deliver */}
      <ul className="m-0 list-none p-0">
        {zones.items.map((z) => (
          <li key={z.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0 flex-1">
              <strong>{z.name}</strong>
              <p className="m-0 text-sm text-ink-3">
                {z.fee ? moneyBase(z.fee) : "Free"}{z.collect ? " · collection" : ` · free over ${moneyBase(z.freeOver ?? shopFreeOver)}`}{z.etaDays && ` · ${z.etaDays} days`}
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
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={zones.isSaving} disabled={!editing?.name.trim()}>Save</Button></div>}
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
          </div>
        )}
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.name} loading={zones.isRemoving} onConfirm={() => zones.remove(removing.id).then(() => setRemoving(null))} />
    </Panel>
  );
}
