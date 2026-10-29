/* Quick Add: A Colour Or A Size, Without Leaving The Product */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";

// The two kinds of size the Sizes page offers: clothing and shoes.
const KINDS = [{ value: "apparel", label: "Clothing" }, { value: "shoe", label: "Shoes" }];
// A new colour starts on the brand teal; a new size starts as clothing.
const BLANK = { colour: { name: "", hex: "#14625a" }, size: { label: "", group: "apparel" } };

/**
 * A dashed chip at the end of a colour or size row that opens a small form,
 * so a missing one is made right there instead of on Categories or Sizes.
 * `kind` is "colour" or "size"; `existing` are the names already taken;
 * `onCreate(values)` saves it and resolves to the new row, which the caller
 * then ticks. A permission the person lacks hides the chip.
 */
export default function QuickAdd({ kind, existing, onCreate }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(BLANK[kind]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // One form serves both: a colour needs a swatch, a size needs its kind.
  const isColour = kind === "colour";
  // The name or label typed so far, trimmed. Two with the same name are refused, ignoring capitals.
  const name = (isColour ? values.name : values.label).trim();
  const clash = existing.some((n) => n.toLowerCase() === name.toLowerCase());

  // Closing clears any error from the last attempt.
  const close = () => { setOpen(false); setError(""); };
  const show = () => { setValues(BLANK[kind]); setError(""); setOpen(true); };
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));

  // The caller saves it (and ticks it on the product); a refusal from the service shows in the form instead of closing it.
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onCreate({ ...values, ...(isColour ? { name } : { label: name }) });
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* The plus and the label share one line, like every other chip in the row. */}
      <button type="button" className="chip chip--raised inline-flex items-center gap-1.5 whitespace-nowrap border-dashed border-brand-300 text-brand-600" onClick={show}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New {kind}
      </button>
      {/* Quick Add Form: opens over the product, so nothing typed on the product is lost */}
      <Modal
        isOpen={open}
        onClose={close}
        title={`New ${kind}`}
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={close}>Cancel</Button><Button onClick={save} loading={saving} disabled={!name || clash || (isColour && !/^#[0-9a-f]{3,8}$/i.test(values.hex))}>Add {kind}</Button></div>}
      >
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (name && !clash) save(); }}>
          {/* Colour: a name and a swatch (the picker and the hex box stay in step) */}
          {isColour ? (
            <>
              <Field label="Name" value={values.name} placeholder="Teal" onChange={(e) => set({ name: e.target.value })} autoFocus error={clash ? "That colour already exists." : undefined} />
              <Field label="Swatch">
                {(id) => (
                  <div className="flex items-center gap-3">
                    <input id={id} type="color" className="h-11 w-14 cursor-pointer rounded-[18px] border border-line-2" value={values.hex} onChange={(e) => set({ hex: e.target.value })} />
                    <input className="input flex-1" aria-label="Swatch as hex" value={values.hex} onChange={(e) => set({ hex: e.target.value })} placeholder="#14625a" />
                  </div>
                )}
              </Field>
            </>
          ) : (
            <>
              <Field label="Size" value={values.label} placeholder="XXL" onChange={(e) => set({ label: e.target.value })} autoFocus hint="As shoppers see it: XS, M, 38…" error={clash ? "That size already exists." : undefined} />
              <Field label="Kind" options={KINDS} value={values.group} onChange={(e) => set({ group: e.target.value })} />
            </>
          )}
          {/* The service's reason, such as a duplicate */}
          {error && <p role="alert" className="m-0 text-sm font-semibold text-warn">{error}</p>}
          <p className="m-0 text-xs text-ink-3">It is added to the end of the {kind} list, ticked on this product. Reorder it under {isColour ? "Categories, Colours" : "Sizes and size guide"}.</p>
        </form>
      </Modal>
    </>
  );
}
