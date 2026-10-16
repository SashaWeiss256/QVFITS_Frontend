/* Attribute List */
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCollection } from "@/store/tanstackStore/queries/admin";

/**
 * Colours, sizes or activities: one ordered list each, the same screen.
 * `fields` are the form's inputs; `name` labels a row; `swatch` draws a
 * colour dot. Deleting something a product still uses is refused by the
 * service with a message saying how many.
 */
export default function AttributeList({ resource, noun, fields, name, swatch, usage, blank }) {
  const items = useCollection(resource);
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can("attributes", "edit");
  const list = items.items;

  const move = (i, by) => {
    const ids = list.map((x) => x.id);
    const [id] = ids.splice(i, 1);
    ids.splice(i + by, 0, id);
    items.reorder(ids);
  };

  const valid = editing && fields.every((f) => !f.required || String(editing[f.key] ?? "").trim());
  const save = async () => {
    if (editing.id) await items.update(editing.id, editing);
    else await items.create(editing);
    setEditing(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canEdit && <Button onClick={() => setEditing(blank)}><Plus className="h-4 w-4" aria-hidden="true" /> Add {noun}</Button>}
      </div>
      <ul className="m-0 grid list-none gap-0 p-0">
        {list.map((x, i) => (
          <li key={x.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
            {canEdit && (
              <span className="flex">
                <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className="icon-btn" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
              </span>
            )}
            {swatch && <i className="sw h-6 w-6" style={{ background: swatch(x) }} aria-hidden="true" />}
            <span className="flex-1">
              <strong>{name(x)}</strong>
              {usage && <span className="ml-2 text-sm text-ink-3">{usage(x)}</span>}
            </span>
            {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => setEditing(x)}>Edit</button>}
            {can("attributes", "delete") && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => setRemoving(x)}>Delete</button>}
          </li>
        ))}
      </ul>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${name(editing)}` : `New ${noun}`}
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={items.isSaving} disabled={!valid}>Save</Button></div>}
      >
        {editing && (
          <div className="grid gap-4">
            {fields.map((f) =>
              f.type === "color" ? (
                <Field key={f.key} label={f.label}>
                  {(id) => (
                    <div className="flex items-center gap-3">
                      <input id={id} type="color" className="h-11 w-14 cursor-pointer rounded-r-sm border border-line-2" value={editing[f.key] || "#000000"} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
                      <input className="input flex-1" aria-label={`${f.label} as hex`} value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} placeholder="#14625a" />
                    </div>
                  )}
                </Field>
              ) : (
                <Field key={f.key} label={f.label} hint={f.hint} options={f.options} value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
              ),
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing && name(removing)} loading={items.isRemoving}
        onConfirm={() => items.remove(removing.id).then(() => setRemoving(null)).catch(() => setRemoving(null))} />
    </>
  );
}
