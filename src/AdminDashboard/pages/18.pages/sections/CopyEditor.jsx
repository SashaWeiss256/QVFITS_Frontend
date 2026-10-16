/* Copy Editor */
import Field from "@/components/ui/Field";
import ListEditor from "@/AdminDashboard/components/ListEditor";

// "primaryCta" → "Primary cta", "seo" → "Seo".
const human = (key) => {
  const words = String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * Fields for any piece of page copy, whatever its shape: text becomes an
 * input (a textarea when long), a list becomes an ordered list editor, and a
 * group becomes a box of its own fields. So a new line of copy added to
 * pages.json is editable here with no new screen.
 */
export default function CopyEditor({ value, onChange, label }) {
  if (typeof value === "string") {
    const long = value.length > 70;
    return <Field label={label} as={long ? "textarea" : undefined} rows={long ? 3 : undefined} value={value} onChange={(e) => onChange(e.target.value)} hint={/\{\w+\}/.test(value) ? "Words in {braces} fill in from Settings." : undefined} />;
  }

  if (typeof value === "number") {
    return <Field label={label} inputMode="numeric" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />;
  }

  if (Array.isArray(value)) {
    const strings = value.every((v) => typeof v === "string");
    const blank = strings ? "" : Object.fromEntries(Object.keys(value[0] ?? {}).map((k) => [k, ""]));
    const items = strings ? value.map((text, i) => ({ id: i, text })) : value.map((v, i) => ({ ...v, id: v.id ?? i }));
    return (
      <div>
        {label && <p className="mb-2 text-sm font-semibold text-ink-2">{label}</p>}
        <ListEditor
          items={items}
          onChange={(next) => onChange(strings ? next.map((x) => x.text) : next.map(({ id, ...rest }) => (value.some((v) => v.id === id) ? { id, ...rest } : rest)))}
          newItem={() => (strings ? { id: Date.now(), text: "" } : { ...blank, id: Date.now() })}
          addLabel="Add"
          itemLabel={(it, i) => (strings ? `${i + 1}` : it.title ?? it.name ?? `${i + 1}`)}
          render={(it, update) =>
            strings ? (
              <CopyEditor value={it.text} onChange={(text) => update({ text })} label="Text" />
            ) : (
              <div className="grid gap-3">
                {Object.entries(it).filter(([k]) => k !== "id").map(([k, v]) => (
                  <CopyEditor key={k} label={human(k)} value={v} onChange={(nv) => update({ [k]: nv })} />
                ))}
              </div>
            )
          }
        />
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <fieldset className="m-0 grid gap-3 rounded-r-md border border-line bg-cream p-4">
        {label && <legend className="px-1 text-sm font-semibold text-ink-2">{label}</legend>}
        {Object.entries(value).map(([k, v]) => (
          <CopyEditor key={k} label={human(k)} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </fieldset>
    );
  }

  return null;
}
