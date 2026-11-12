/* Attribute List */
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, LayoutGrid, List, Pencil, Plus, Rows3, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import { readStored, writeStored } from "@/utils/storage";

// The three ways to look at the same list. Cards are the default; the choice is remembered per kind of list.
const VIEWS = [
  { id: "cards", label: "Cards", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "compact", label: "Compact", icon: Rows3 },
];

/**
 * Colours or sizes in the order the shop lists them, the same screen for
 * both, in three views: cards (a wall of tiles, left to right then down), a
 * list (one row each, with its detail) and compact (small pills, for a long
 * range). The view is remembered. `name` labels a tile,
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
  const viewKey = `qvfits:attr-view:${noun}`;
  const [view, setViewState] = useState(() => (VIEWS.some((v) => v.id === readStored(viewKey, "")) ? readStored(viewKey, "cards") : "cards"));
  const setView = (id) => { setViewState(id); writeStored(viewKey, id); };
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
      {/* View switch, and Add for the views that have no dashed tile */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-r-pill bg-cream-2 p-1" role="radiogroup" aria-label="View as">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" role="radio" aria-checked={view === v.id} onClick={() => setView(v.id)}
              className={cn("inline-flex min-h-9 items-center gap-2 rounded-r-pill px-4 text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-brand-300", view === v.id ? "bg-white text-brand-600 shadow-sh-1" : "text-ink-3 hover:text-ink")}>
              <v.icon className="h-4 w-4" aria-hidden="true" /> {v.label}
            </button>
          ))}
        </div>
        {canEdit && view !== "cards" && <Button variant="ghost" onClick={() => setEditing(blank)}><Plus className="h-4 w-4" aria-hidden="true" /> Add {noun}</Button>}
      </div>

      {/* List: one row each, with its detail and controls */}
      {view === "list" && (
        <ul className="m-0 list-none divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-white p-0">
          {list.map((x, i) => {
            const used = usage?.(x);
            return (
              <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors duration-150 hover:bg-cream/60">
                {swatch ? <i className="sw h-9 w-9 shrink-0 ring-1 ring-line" style={{ background: swatch(x) }} aria-hidden="true" /> : <span className="grid h-9 min-w-9 shrink-0 place-items-center rounded-[14px] bg-brand-50 px-2 font-display font-bold text-brand-600" aria-hidden="true">{name(x)}</span>}
                <div className="min-w-0 flex-1">
                  <strong className="block truncate font-display">{swatch ? name(x) : `Size ${name(x)}`}</strong>
                  {caption && <span className="block truncate text-xs text-ink-4">{caption(x)}</span>}
                </div>
                {swatch && <code className="hidden text-xs uppercase text-ink-3 sm:block">{swatch(x)}</code>}
                {used && <span className={cn("w-28 text-sm", used === "Not used yet" ? "text-ink-4" : "text-ink-3")}>{used}</span>}
                <span className="flex">
                  {canEdit && (
                    <>
                      <button type="button" className="icon-btn" aria-label={`Move ${name(x)} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" className="icon-btn" aria-label={`Move ${name(x)} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" className="icon-btn" aria-label={`Edit ${name(x)}`} title="Edit" onClick={() => setEditing(x)}><Pencil className="h-4 w-4" /></button>
                    </>
                  )}
                  {can(module, "delete") && <button type="button" className="icon-btn text-warn" aria-label={`Delete ${name(x)}`} title="Delete" onClick={() => setRemoving(x)}><Trash2 className="h-4 w-4" /></button>}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Compact: small pills, a click opens the edit form (where it can also be deleted) */}
      {view === "compact" && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {list.map((x) => {
            const body = (<>{swatch && <i className="sw h-5 w-5 shrink-0 ring-1 ring-line" style={{ background: swatch(x) }} aria-hidden="true" />}<span>{name(x)}</span></>);
            const pill = "inline-flex min-h-10 items-center gap-2 rounded-r-pill border border-line-2 bg-white px-4 text-sm font-medium transition-colors duration-150";
            return (
              <li key={x.id}>
                {canEdit ? <button type="button" className={cn(pill, "outline-none hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-300")} aria-label={`Edit ${name(x)}`} onClick={() => setEditing(x)}>{body}</button> : <span className={pill}>{body}</span>}
              </li>
            );
          })}
        </ul>
      )}

      {/* Tiles: a swatch or the size itself, its name, what uses it, and its controls */}
      {view === "cards" && (
      <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]">
        {list.map((x, i) => {
          // Whether anything uses it; an unused one is shown muted.
          const used = usage?.(x);
          const unused = used === "Not used yet";
          return (
            <li key={x.id} className="flex flex-col gap-4 rounded-[18px] border border-line bg-white p-4 transition-[border-color,box-shadow] duration-200 hover:border-brand-200 hover:shadow-sh-1">
              <div className="flex items-center gap-3">
                {swatch ? (
                  <i className="sw h-12 w-12 shrink-0 ring-1 ring-line" style={{ background: swatch(x) }} aria-hidden="true" />
                ) : (
                  <span className="grid h-12 min-w-12 shrink-0 place-items-center rounded-[14px] bg-brand-50 px-2 font-display text-lg font-bold text-brand-600" aria-hidden="true">{name(x)}</span>
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
              className="flex h-full min-h-[8.5rem] w-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-2 text-sm font-semibold text-ink-3 outline-none transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-300"
              onClick={() => setEditing(blank)}
            >
              <Plus className="h-5 w-5" aria-hidden="true" /> Add {noun}
            </button>
          </li>
        )}
      </ul>
      )}
      {!list.length && !items.isLoading && !canEdit && <p className="py-8 text-center text-ink-3">Nothing here yet.</p>}

      {/* Edit Form: the page says which fields it has */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${name(editing)}` : `New ${noun}`}
        size="sm"
        footer={<div className="flex items-center justify-end gap-2.5">{editing?.id && can(module, "delete") && <Button variant="ghost" className="mr-auto text-warn" onClick={() => { setRemoving(editing); setEditing(null); }}>Delete</Button>}<Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={items.isSaving} disabled={!valid}>Save</Button></div>}
      >
        {editing && (
          <div className="grid gap-4">
            {fields.map((f) =>
              f.type === "color" ? (
                <Field key={f.key} label={f.label}>
                  {(id) => (
                    <div className="flex items-center gap-3">
                      <input id={id} type="color" className="h-11 w-14 cursor-pointer rounded-[10px] border border-line-2" value={editing[f.key] || "#000000"} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
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
