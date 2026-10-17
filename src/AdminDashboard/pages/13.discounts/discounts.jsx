/* Admin Discount Codes */
import { useState } from "react";
import { Plus, Shuffle } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { categoriesResource, discountsResource, productsResource, randomCode, useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";
import Toggle from "@/AdminDashboard/components/Toggle";

const BLANK = {
  code: "", description: "", type: "percent", value: 10, minSpend: 0, startsAt: null, endsAt: null,
  usageLimit: null, perCustomerLimit: 1, appliesTo: { scope: "all", ids: [] }, active: true,
};
const TYPES = [{ value: "percent", label: "Percentage off" }, { value: "fixed", label: "Amount off (UGX)" }, { value: "free_shipping", label: "Free delivery" }];

/** Where a code stands today, from its switch, dates and uses. */
function stateOf(d) {
  const now = Date.now();
  if (!d.active) return { id: "inactive", label: "Off" };
  if (d.startsAt && Date.parse(d.startsAt) > now) return { id: "pending", label: "Scheduled" };
  if (d.endsAt && Date.parse(d.endsAt) < now) return { id: "archived", label: "Expired" };
  if (d.usageLimit !== null && d.usedCount >= d.usageLimit) return { id: "archived", label: "Used up" };
  return { id: "active", label: "Live" };
}

const day = (iso) => (iso ? iso.slice(0, 10) : "");
const toIso = (v, end) => (v ? new Date(`${v}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : null);
const intOrNull = (v) => (v === "" ? null : Math.max(0, Number(String(v).replace(/\D/g, "")) || 0));

/**
 * Codes shoppers type at checkout. Each can be a percentage, an amount or
 * free delivery; can start and end on set days; can need a minimum spend;
 * can cap how often it is used overall and per shopper; and can cover the
 * whole shop or only some categories or pieces.
 */
export default function AdminDiscounts() {
  const discounts = useCollection(discountsResource);
  const categories = useCollection(categoriesResource);
  const products = useCollection(productsResource);
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can("discounts", "edit");

  const worth = (d) => (d.type === "percent" ? `${d.value}% off` : d.type === "fixed" ? `${moneyBase(d.value)} off` : "Free delivery");
  const columns = [
    { key: "code", label: "Code", sort: (d) => d.code, render: (d) => <span><strong className="font-display tracking-wide">{d.code}</strong>{d.description && <span className="block text-xs text-ink-3">{d.description}</span>}</span> },
    { key: "worth", label: "Gives", render: worth },
    { key: "rules", label: "Rules", render: (d) => <span className="text-sm text-ink-3">{[d.minSpend ? `over ${moneyBase(d.minSpend)}` : "", d.appliesTo.scope !== "all" ? `${d.appliesTo.ids.length} ${d.appliesTo.scope}` : "", d.endsAt ? `ends ${formatDate(d.endsAt)}` : ""].filter(Boolean).join(" · ") || "Any order"}</span> },
    { key: "used", label: "Used", align: "right", sort: (d) => d.usedCount, render: (d) => `${d.usedCount}${d.usageLimit !== null ? ` of ${d.usageLimit}` : ""}` },
    { key: "status", label: "Status", render: (d) => { const s = stateOf(d); return <StatusChip status={s.id} label={s.label} />; } },
  ];

  const save = async () => {
    const data = { ...editing };
    if (editing.id) await discounts.update(editing.id, data);
    else await discounts.create(data);
    setEditing(null);
  };
  const e = editing;
  const set = (patch) => setEditing((x) => ({ ...x, ...patch }));
  const scope = (patch) => set({ appliesTo: { ...e.appliesTo, ...patch } });

  return (
    <>
      <PageHeader
        lede="Codes shoppers type at checkout. The price is always checked again when the order is placed."
        action={canEdit && <Button onClick={() => setEditing({ ...BLANK, code: randomCode() })}><Plus className="h-4 w-4" aria-hidden="true" /> New code</Button>}
      />
      <Panel>
        <DataTable
          rows={discounts.items}
          loading={discounts.isLoading}
          columns={columns}
          search={(d) => `${d.code} ${d.description}`}
          filters={[{ id: "state", label: "Status", options: ["Live", "Scheduled", "Expired", "Used up", "Off"].map((l) => ({ value: l, label: l })), test: (d, v) => stateOf(d).label === v }]}
          onRowClick={canEdit ? (d) => setEditing(d) : undefined}
          rowActions={(d) => [
            { label: "Edit", onClick: () => setEditing(d), hidden: !canEdit },
            { label: d.active ? "Switch off" : "Switch on", onClick: () => discounts.update(d.id, { active: !d.active }), hidden: !canEdit },
            { label: "Duplicate", onClick: () => setEditing({ ...d, id: undefined, code: randomCode(), usedCount: 0 }), hidden: !canEdit },
            { label: "Delete", danger: true, onClick: () => setRemoving(d), hidden: !can("discounts", "delete") },
          ]}
          exportName="discount-codes"
          exportRow={(d) => ({ code: d.code, type: d.type, value: d.value, minSpend: d.minSpend, used: d.usedCount, limit: d.usageLimit ?? "", starts: day(d.startsAt), ends: day(d.endsAt), status: stateOf(d).label })}
          empty="No codes yet."
        />
      </Panel>

      <Drawer
        open={Boolean(e)}
        onClose={() => setEditing(null)}
        title={e?.id ? `Edit ${e.code}` : "New discount code"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={discounts.isSaving} disabled={!e?.code.trim()}>Save code</Button></>}
      >
        {e && (
          <div className="grid gap-5">
            <div className="flex items-end gap-2">
              <Field label="Code" className="flex-1" value={e.code} onChange={(ev) => set({ code: ev.target.value.toUpperCase().replace(/\s+/g, "") })} hint="What shoppers type. Letters and numbers." />
              <Button variant="soft" aria-label="Make a random code" onClick={() => set({ code: randomCode() })}><Shuffle className="h-4 w-4" /></Button>
            </div>
            <Field label="Internal description" value={e.description} onChange={(ev) => set({ description: ev.target.value })} placeholder="e.g. Instagram giveaway, October" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gives" options={TYPES} value={e.type} onChange={(ev) => set({ type: ev.target.value })} />
              {e.type !== "free_shipping" && (
                <Field label={e.type === "percent" ? "Percent off" : "UGX off"} inputMode="numeric" value={e.value} onChange={(ev) => set({ value: intOrNull(ev.target.value) ?? 0 })} />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Minimum spend (UGX)" inputMode="numeric" value={e.minSpend || ""} placeholder="None" onChange={(ev) => set({ minSpend: intOrNull(ev.target.value) ?? 0 })} />
              <div />
              <Field label="Starts" type="date" value={day(e.startsAt)} onChange={(ev) => set({ startsAt: toIso(ev.target.value) })} hint="Empty starts now." />
              <Field label="Ends" type="date" value={day(e.endsAt)} onChange={(ev) => set({ endsAt: toIso(ev.target.value, true) })} hint="Empty never ends." />
              <Field label="Total uses" inputMode="numeric" value={e.usageLimit ?? ""} placeholder="Unlimited" onChange={(ev) => set({ usageLimit: intOrNull(ev.target.value) })} />
              <Field label="Uses per shopper" inputMode="numeric" value={e.perCustomerLimit ?? ""} placeholder="Unlimited" onChange={(ev) => set({ perCustomerLimit: intOrNull(ev.target.value) })} hint="Counted for signed-in shoppers." />
            </div>

            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold text-ink-2">Covers</legend>
              <div className="mb-3 flex flex-wrap gap-2">
                {[["all", "Everything"], ["categories", "Some categories"], ["products", "Some pieces"]].map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={e.appliesTo.scope === v} className={cn("chip", e.appliesTo.scope === v && "is-on")} onClick={() => scope({ scope: v, ids: [] })}>{l}</button>
                ))}
              </div>
              {e.appliesTo.scope === "categories" && (
                <div className="flex flex-wrap gap-1.5">
                  {categories.items.map((c) => {
                    const on = e.appliesTo.ids.includes(c.id);
                    return <button key={c.id} type="button" aria-pressed={on} className={cn("chip", on && "is-on")} onClick={() => scope({ ids: on ? e.appliesTo.ids.filter((x) => x !== c.id) : [...e.appliesTo.ids, c.id] })}>{c.name}</button>;
                  })}
                </div>
              )}
              {e.appliesTo.scope === "products" && <ProductPicker products={products.items} value={e.appliesTo.ids} onChange={(ids) => scope({ ids })} ordered={false} />}
            </fieldset>

            <Toggle checked={e.active} onChange={(active) => set({ active })} label="Switched on" hint="Off keeps the code but checkout refuses it." />
            {e.id && <p className="m-0 text-sm text-ink-3">Used {e.usedCount} {e.usedCount === 1 ? "time" : "times"} so far.</p>}
          </div>
        )}
      </Drawer>
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.code} loading={discounts.isRemoving} onConfirm={() => discounts.remove(removing.id).then(() => setRemoving(null))} />
    </>
  );
}
