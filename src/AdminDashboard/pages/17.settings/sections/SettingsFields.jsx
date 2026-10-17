/* Settings Fields */
import Field from "@/components/ui/Field";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";

export default function SettingsFields({ groups, draft, set }) {
  return groups.map(([title, fields]) => (
    <Panel key={title} title={title}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, hint, wide, number]) => (
          <Field
            key={key}
            label={label}
            hint={hint}
            className={wide ? "sm:col-span-2" : undefined}
            inputMode={number ? "numeric" : undefined}
            value={draft[key] ?? ""}
            onChange={(e) => set(key, number ? Number(e.target.value.replace(/\D/g, "")) || 0 : e.target.value)}
          />
        ))}
      </div>
    </Panel>
  ));
}

/** Display currencies and their rates. UGX is what the shop settles in. */
export function Currencies({ draft, set }) {
  return (
    <Panel title="Currencies">
      <p className="mt-0 text-sm text-ink-3">Shoppers abroad can view prices in these. Rates go stale; the date shows on the shop so an old rate looks old.</p>
      <Field label="Rates last checked" className="mb-4 max-w-xs" value={draft.ratesUpdated} onChange={(e) => set("ratesUpdated", e.target.value)} />
      <ListEditor
        items={draft.currencies.map((c) => ({ ...c, id: c.code }))}
        onChange={(items) => set("currencies", items.map(({ id: _id, ...c }) => c))}
        newItem={() => ({ id: `new-${Date.now()}`, code: "", label: "", perUGX: 0, decimals: 2 })}
        addLabel="Add a currency"
        itemLabel={(c) => c.code || "New currency"}
        render={(c, update) => (
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Code" value={c.code} disabled={c.code === "UGX" && c.perUGX === 1} onChange={(e) => update({ code: e.target.value.toUpperCase().slice(0, 3) })} />
            <Field label="Name" value={c.label} onChange={(e) => update({ label: e.target.value })} />
            <Field label="Per 1 UGX" value={c.perUGX} disabled={c.code === "UGX"} onChange={(e) => update({ perUGX: Number(e.target.value) || 0 })} />
            <Field label="Decimals" inputMode="numeric" value={c.decimals} onChange={(e) => update({ decimals: Number(e.target.value) || 0 })} />
          </div>
        )}
      />
    </Panel>
  );
}
