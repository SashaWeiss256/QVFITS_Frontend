/* Settings Fields */
import Field from "@/components/ui/Field";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";

export default function SettingsFields({ groups, draft, set }) {
  // Each group becomes a panel; a field is [key, label, hint, wide, number], so a new setting is one line in settingsGroups.js.
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
            // A number field keeps digits only and counts an empty box as 0.
            onChange={(e) => set(key, number ? Number(e.target.value.replace(/\D/g, "")) || 0 : e.target.value)}
          />
        ))}
      </div>
    </Panel>
  ));
}

/**
 * Display currencies. Rates are not typed in: the shop fetches the day's rates
 * by itself and shows them to shoppers, falling back to the last ones it had.
 * What is set here is which currencies are offered and how many decimals each
 * shows. UGX is what the shop settles in.
 */
export function Currencies({ draft, set }) {
  return (
    <Panel title="Currencies" hint="Shoppers abroad can view prices in these. Rates update by themselves every few hours, so there is nothing to type. Orders are always charged in UGX.">
      <ListEditor
        // Currencies need an id for the list editor, so the code stands in for it and is dropped again on save.
        items={draft.currencies.map((c) => ({ ...c, id: c.code }))}
        onChange={(items) => set("currencies", items.map(({ id: _id, ...c }) => c))}
        newItem={() => ({ id: `new-${Date.now()}`, code: "", label: "", perUGX: 0, decimals: 2 })}
        addLabel="Add a currency"
        itemLabel={(c) => (c.code ? `${c.code}  ${c.label}` : "New currency")}
        render={(c, update) => (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Code" hint="Three letters, such as KES" value={c.code} disabled={c.code === "UGX" && c.perUGX === 1} onChange={(e) => update({ code: e.target.value.toUpperCase().slice(0, 3) })} />
            <Field label="Name" value={c.label} onChange={(e) => update({ label: e.target.value })} />
            <Field label="Decimals shown" hint="0 for whole amounts" inputMode="numeric" value={c.decimals} onChange={(e) => update({ decimals: Number(e.target.value) || 0 })} />
          </div>
        )}
      />
    </Panel>
  );
}
