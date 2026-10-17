/* Admin Discount Codes */
import { useState } from "react";
import { Copy, Plus, Receipt, Shuffle, Tag, UsersRound, Wallet } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import { categoriesResource, discountsResource, productsResource, randomCode, useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";
import Tabs from "@/AdminDashboard/components/Tabs";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";
import Toggle from "@/AdminDashboard/components/Toggle";

const BLANK = {
  code: "", description: "", type: "percent", value: 10, minSpend: 0, startsAt: null, endsAt: null,
  usageLimit: null, perCustomerLimit: 1, appliesTo: { scope: "all", ids: [] }, onSaleItems: false, active: true,
};
const DAY = 86_400_000;
// The tabs group the states the way the shop thinks of them.
const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "scheduled", label: "Scheduled" },
  { id: "off", label: "Switched off" },
  { id: "ended", label: "Ended" },
];
const TAB_OF = { active: "live", pending: "scheduled", inactive: "off", archived: "ended" };
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
  const [tab, setTab] = useState("all");
  const canEdit = can("discounts", "edit");
  const items = discounts.items;
  const shown = tab === "all" ? items : items.filter((d) => TAB_OF[stateOf(d).id] === tab);
  const totals = items.reduce((t, d) => ({ orders: t.orders + d.orders, revenue: t.revenue + d.revenue, given: t.given + d.given }), { orders: 0, revenue: 0, given: 0 });
  const customers = items.reduce((n, d) => n + d.customers, 0);
  const copy = (code) => navigator.clipboard?.writeText(code).then(() => notify(`${code} copied.`, { tone: "success" }));
  const extend = (d) => discounts.update(d.id, { endsAt: new Date(Date.now() + 30 * DAY).toISOString(), active: true });

  const worth = (d) => (d.type === "percent" ? `${d.value}% off` : d.type === "fixed" ? `${moneyBase(d.value)} off` : "Free delivery");
  const columns = [
    {
      key: "code",
      label: "Code",
      sort: (d) => d.code,
      render: (d) => (
        <span className="flex items-start gap-2">
          <span>
            <strong className="font-display tracking-wide">{d.code}</strong>
            {d.description && <span className="block text-xs text-ink-3">{d.description}</span>}
          </span>
          <button type="button" className="icon-btn h-7 min-h-0 w-7" aria-label={`Copy ${d.code}`} onClick={(ev) => { ev.stopPropagation(); copy(d.code); }}><Copy className="h-3.5 w-3.5" /></button>
        </span>
      ),
    },
    { key: "worth", label: "Gives", render: worth },
    {
      key: "rules",
      label: "Rules",
      render: (d) => {
        const soon = d.endsAt && Date.parse(d.endsAt) > Date.now() && Date.parse(d.endsAt) - Date.now() < 14 * DAY;
        return (
          <span className="text-sm text-ink-3">
            {[d.minSpend ? `over ${moneyBase(d.minSpend)}` : "", d.appliesTo.scope !== "all" ? `${d.appliesTo.ids.length} ${d.appliesTo.scope}` : "", d.onSaleItems === false ? "not on sale items" : ""].filter(Boolean).join(" · ") || "Any order"}
            {d.endsAt && <span className={cn("block", soon && "font-semibold text-warn")}>{soon ? `Ends in ${Math.ceil((Date.parse(d.endsAt) - Date.now()) / DAY)} days` : `Ends ${formatDate(d.endsAt)}`}</span>}
          </span>
        );
      },
    },
    {
      key: "used",
      label: "Use",
      sort: (d) => d.orders,
      render: (d) => (
        <span className="block min-w-[120px] text-sm">
          {d.orders} {d.orders === 1 ? "order" : "orders"} · {d.customers} {d.customers === 1 ? "shopper" : "shoppers"}
          <span className="block text-xs text-ink-3">{moneyBase(d.revenue)} taken, {moneyBase(d.given)} off</span>
          {d.usageLimit !== null && (
            <span className="mt-1 block h-1.5 overflow-hidden rounded-r-pill bg-cream-2" title={`${d.orders} of ${d.usageLimit}`}>
              <span className="block h-full rounded-r-pill bg-[image:var(--brand-grad)]" style={{ width: `${Math.min(100, (d.orders / d.usageLimit) * 100)}%` }} />
            </span>
          )}
        </span>
      ),
    },
    { key: "status", label: "Status", render: (d) => { const s = stateOf(d); return <StatusChip status={s.id} label={s.label} />; } },
  ];

  const save = async () => {
    // Use counts are worked out from orders, never saved.
    const { orders: _o, customers: _c, revenue: _r, given: _g, usedCount: _u, ...data } = editing;
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
        lede="Codes shoppers type at checkout: create, switch off, extend. Uses are counted from orders, and a cancelled or refunded order gives its use back."
        action={canEdit && <Button onClick={() => setEditing({ ...BLANK, code: randomCode() })}><Plus className="h-4 w-4" aria-hidden="true" /> New code</Button>}
      />
      <section aria-label="What codes did" className="mb-6 grid gap-px overflow-hidden rounded-r-lg border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Redemptions" icon={Receipt} loading={discounts.isLoading} value={totals.orders} note={`Across ${items.filter((d) => stateOf(d).id === "active").length} live codes`} />
        <StatCard label="Shoppers" icon={UsersRound} loading={discounts.isLoading} value={customers} note="Who used a code" />
        <StatCard label="Revenue from codes" icon={Wallet} loading={discounts.isLoading} value={moneyBase(totals.revenue)} />
        <StatCard label="Discount given" icon={Tag} loading={discounts.isLoading} value={moneyBase(totals.given)} note={totals.orders ? `${moneyBase(Math.round(totals.given / totals.orders))} per order` : undefined} />
      </section>
      <Tabs tabs={TABS.map((t) => ({ ...t, count: t.id === "all" ? items.length : items.filter((d) => TAB_OF[stateOf(d).id] === t.id).length }))} value={tab} onChange={setTab} />
      <Panel>
        <DataTable
          rows={shown}
          loading={discounts.isLoading}
          columns={columns}
          search={(d) => `${d.code} ${d.description}`}
          onRowClick={canEdit ? (d) => setEditing(d) : undefined}
          rowActions={(d) => [
            { label: "Edit", onClick: () => setEditing(d), hidden: !canEdit },
            { label: d.active ? "Switch off" : "Switch on", onClick: () => discounts.update(d.id, { active: !d.active }), hidden: !canEdit },
            { label: "Extend 30 days", onClick: () => extend(d), hidden: !canEdit || stateOf(d).label !== "Expired" },
            { label: "Copy code", onClick: () => copy(d.code) },
            { label: "Duplicate", onClick: () => setEditing({ ...d, id: undefined, code: randomCode(), usedCount: 0 }), hidden: !canEdit },
            { label: "Delete", danger: true, onClick: () => setRemoving(d), hidden: !can("discounts", "delete") },
          ]}
          exportName="discount-codes"
          exportRow={(d) => ({ code: d.code, type: d.type, value: d.value, minSpend: d.minSpend, orders: d.orders, shoppers: d.customers, revenue: d.revenue, discountGiven: d.given, limit: d.usageLimit ?? "", starts: day(d.startsAt), ends: day(d.endsAt), status: stateOf(d).label })}
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

            <Toggle checked={e.onSaleItems !== false} onChange={(onSaleItems) => set({ onSaleItems })} label="Also on sale items" hint="Off: pieces already on sale are left out, so the code never stacks on the sale." />
            <Toggle checked={e.active} onChange={(active) => set({ active })} label="Switched on" hint="Off keeps the code but checkout refuses it." />
            {e.id && <p className="m-0 text-sm text-ink-3">Used on {e.orders} {e.orders === 1 ? "order" : "orders"} so far.</p>}
          </div>
        )}
      </Drawer>
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.code} loading={discounts.isRemoving} onConfirm={() => discounts.remove(removing.id).then(() => setRemoving(null))} />
    </>
  );
}
