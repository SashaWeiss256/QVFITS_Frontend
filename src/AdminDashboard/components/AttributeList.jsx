/* Attribute List */
import { useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";

/**
 * Colours or sizes, as a wall of tiles in the order the shop lists them
 * (left to right, then down), the same screen for both. `name` labels a tile,
 * `swatch` draws a colour disc (without one the name is the badge), `caption`
 * is a line under the name and `usage` says what uses it. A dashed tile at
 * the end adds one. Deleting something a product still uses is refused by
 * the service with a message saying how many.
 */
export default function AttributeList({ resource, module, noun, fields, name, swatch, caption, usage, blank }) {
  const items = useCollection(resource);
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can(module, "edit");
  const list = items.items;

  // Tiles read left to right, so "earlier" and "later" move a tile one place along; the shop lists them in this order.
  const move = (i, by) => {
    const ids = list.map((x) => x.id);
    const [id] = ids.splice(i, 1);
    ids.splice(i + by, 0, id);
    items.reorder(ids);
  };

  // A save is allowed once every required field has something in it.
  const valid = editing && fields.every((f) => !f.required || String(editing[f.key] ?? "").trim());
  // Saving either adds a tile or updates the one being edited.
  const save = async () => {
    if (editing.id) await items.update(editing.id, editing);
    else await items.create(editing);
    setEditing(null);
  };

  return (
    <>
      {/* Tiles: a swatch or the size itself, its name, what uses it, and its controls */}
      <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]">
        {list.map((x, i) => {
          // Whether anything uses it; an unused one is shown muted.
          const used = usage?.(x);
          const unused = used === "Not used yet";
          return (
            <li key={x.id} className="flex flex-col gap-4 rounded-r-lg border border-line bg-white p-4 transition-[border-color,box-shadow] duration-200 hover:border-brand-200 hover:shadow-sh-1">
              <div className="flex items-center gap-3">
                {swatch ? (
                  <i className="sw h-12 w-12 shrink-0 ring-1 ring-line" style={{ background: swatch(x) }} aria-hidden="true" />
                ) : (
                  <span className="grid h-12 min-w-12 shrink-0 place-items-center rounded-r-md bg-brand-50 px-2 font-display text-lg font-bold text-brand-600" aria-hidden="true">{name(x)}</span>
                )}
                <span className="min-w-0">
                  <strong className="block truncate font-display text-[1.05rem]">{swatch ? name(x) : `Size ${name(x)}`}</strong>
                  {caption && <span className="block truncate text-xs text-ink-4">{caption(x)}</span>}
                  {used && <span className={cn("block text-sm", unused ? "text-ink-4" : "text-ink-3")}>{used}</span>}
                </span>
              </div>
              {(canEdit || can(module, "delete")) && (
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <span className="flex">
                    {canEdit && (
                      <>
                        <button type="button" className="icon-btn" aria-label={`Move ${name(x)} earlier`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowLeft className="h-4 w-4" /></button>
                        <button type="button" className="icon-btn" aria-label={`Move ${name(x)} later`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowRight className="h-4 w-4" /></button>
                      </>
                    )}
                  </span>
                  <span className="flex">
                    {canEdit && <button type="button" className="icon-btn" aria-label={`Edit ${name(x)}`} title="Edit" onClick={() => setEditing(x)}><Pencil className="h-4 w-4" /></button>}
                    {can(module, "delete") && <button type="button" className="icon-btn text-warn" aria-label={`Delete ${name(x)}`} title="Delete" onClick={() => setRemoving(x)}><Trash2 className="h-4 w-4" /></button>}
                  </span>
                </div>
              )}
            </li>
          );
        })}
        {/* The dashed tile at the end adds one. */}
        {canEdit && (
          <li>
            <button
              type="button"
              className="flex h-full min-h-[8.5rem] w-full flex-col items-center justify-center gap-2 rounded-r-lg border-2 border-dashed border-line-2 text-sm font-semibold text-ink-3 outline-none transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-300"
              onClick={() => setEditing(blank)}
            >
              <Plus className="h-5 w-5" aria-hidden="true" /> Add {noun}
            </button>
          </li>
        )}
      </ul>
      {!list.length && !items.isLoading && !canEdit && <p className="py-8 text-center text-ink-3">Nothing here yet.</p>}

      {/* Edit Form: the page says which fields it has */}
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

      {/* Delete Confirmation: the service refuses a colour or size a product still uses, and says how many */}
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing && name(removing)} loading={items.isRemoving}
        onConfirm={() => items.remove(removing.id).then(() => setRemoving(null)).catch(() => setRemoving(null))} />
    </>
  );
}
