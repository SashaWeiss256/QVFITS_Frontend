/* Record A Sale */
import { useState } from "react";
import { Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useRecordSale } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import Drawer from "@/AdminDashboard/components/Drawer";

const BLANK = { name: "", phone: "", email: "", region: "", address: "", note: "", discountCode: "", reference: "" };
const SOURCES = [
  { id: "showroom", label: "In the showroom", hint: "Paid at the counter, taken away now." },
  { id: "whatsapp", label: "On WhatsApp", hint: "Paid by mobile money before it goes out." },
];
const METHODS = [
  { id: "cash", label: "Cash" },
  { id: "mtn", label: "MTN Mobile Money" },
  { id: "airtel", label: "Airtel Money" },
];

/**
 * A sale paid on the spot, in the showroom or on WhatsApp. It is priced and
 * stock-checked exactly like a shop order and settled at once, with the
 * payment recorded against it, so the books and the shelves always match.
 * Online orders only come from the shop's checkout.
 */
export default function RecordSale({ open, onClose, products, settings, onCreated }) {
  const create = useRecordSale();
  const [source, setSource] = useState("showroom");
  const [method, setMethod] = useState("cash");
  const { moneyBase } = useCurrency();
  const zones = settings?.zones ?? [];
  const [form, setForm] = useState(BLANK);
  const [lines, setLines] = useState([]);
  const [pick, setPick] = useState("");
  const live = products.filter((p) => p.status === "active");
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  // A showroom sale is collected at the counter, so it starts on the collection zone.
  const counter = zones.find((z) => z.collect)?.id;
  const region = form.region || (source === "showroom" ? counter : undefined) || zones[0]?.id || "";
  const collect = zones.find((z) => z.id === region)?.collect;

  const addLine = () => {
    const p = live.find((x) => x.id === pick);
    if (!p) return;
    const size = Object.keys(p.stock).find((s) => p.stock[s] > 0) ?? Object.keys(p.stock)[0];
    setLines((ls) => [...ls, { productId: p.id, color: p.colors[0], size, qty: 1 }]);
    setPick("");
  };
  const updateLine = (i, patch) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const subtotal = lines.reduce((n, l) => n + (live.find((p) => p.id === l.productId)?.price ?? 0) * l.qty, 0);
  // Mobile money always has a reference; cash doesn't need one.
  const ready = form.name.trim() && form.phone.trim() && lines.length && (collect || form.address.trim()) && (method === "cash" || form.reference.trim());

  const submit = async () => {
    const { reference, ...input } = form;
    const order = await create.mutateAsync({ input: { ...input, region, payment: method, lines }, source, method, reference }).catch(() => null);
    if (!order) return;
    setForm(BLANK);
    setLines([]);
    onCreated(order);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      wide
      title="Record a sale"
      subtitle="A sale paid on the spot. It's added to orders as paid, and the stock comes off the shelf."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={create.isPending} disabled={!ready}>Record sale</Button></>}
    >
      <div className="grid gap-6">
        <section className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Where the sale happened">
          {SOURCES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={source === x.id}
              onClick={() => { setSource(x.id); set({ region: "" }); }}
              className={cn("rounded-r-md border p-3 text-left transition-colors duration-150", source === x.id ? "border-brand-300 bg-brand-50" : "border-line bg-white hover:bg-cream")}
            >
              <strong className="block text-sm">{x.label}</strong>
              <span className="text-[.8rem] text-ink-3">{x.hint}</span>
            </button>
          ))}
        </section>
        <section>
          <h3 className="mb-3 text-base">Pieces</h3>
          <div className="flex gap-2">
            <select className="input flex-1" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Add a piece">
              <option value="">Pick a piece…</option>
              {live.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Button variant="soft" onClick={addLine} disabled={!pick}>Add</Button>
          </div>
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {lines.map((l, i) => {
              const p = live.find((x) => x.id === l.productId);
              return (
                <li key={i} className="grid items-end gap-2 rounded-r-md bg-white p-3 shadow-sh-1 sm:grid-cols-[1fr_auto_auto_auto_auto]">
                  <strong className="text-sm sm:self-center">{p?.name}</strong>
                  <Field label="Colour" options={p.colors.map((c) => ({ value: c, label: c }))} value={l.color} onChange={(e) => updateLine(i, { color: e.target.value })} />
                  <Field label="Size" options={Object.keys(p.stock).map((s) => ({ value: s, label: `${s} (${p.stock[s]})` }))} value={l.size} onChange={(e) => updateLine(i, { size: e.target.value })} />
                  <Field label="Qty" inputMode="numeric" className="w-20" value={l.qty} onChange={(e) => updateLine(i, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                  <button type="button" className="icon-btn text-warn" aria-label="Remove" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul>
          {lines.length > 0 && <p className="mt-2 text-sm text-ink-3">Subtotal {moneyBase(subtotal)}, before delivery and any code. The final price is worked out when you create it.</p>}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <h3 className="m-0 text-base sm:col-span-2">Customer</h3>
          <Field label="Name" value={form.name} onChange={(e) => set({ name: e.target.value })} />
          <Field label="Phone" inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          <Field label="Email (optional)" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
          <Field label="Delivery" options={zones.map((z) => ({ value: z.id, label: z.name }))} value={region} onChange={(e) => set({ region: e.target.value })} />
          {!collect && <Field label="Address" className="sm:col-span-2" value={form.address} onChange={(e) => set({ address: e.target.value })} />}
          <Field label="Paid by" options={METHODS.map((m) => ({ value: m.id, label: m.label }))} value={method} onChange={(e) => setMethod(e.target.value)} />
          {method !== "cash" && <Field label="Mobile money reference" value={form.reference} onChange={(e) => set({ reference: e.target.value })} hint="The transaction ID from the payment message." />}
          <Field label="Discount code (optional)" value={form.discountCode} onChange={(e) => set({ discountCode: e.target.value })} />
          <Field label="Note" as="textarea" rows={2} className="sm:col-span-2" value={form.note} onChange={(e) => set({ note: e.target.value })} />
        </section>
        {create.error && <p role="alert" className="m-0 text-sm font-semibold text-warn">{create.error.message}</p>}
      </div>
    </Drawer>
  );
}
