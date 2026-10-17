/* Shop By Group Card */
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react";

import StatusChip from "@/components/ui/StatusChip";
import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";
import Toggle from "@/AdminDashboard/components/Toggle";

const KINDS = {
  category: { label: "Category", hint: "Every product has one", noun: "category" },
  tags: { label: "Tags", hint: "Products can have several", noun: "item" },
  edits: { label: "Edits", hint: "Curated links", noun: "link" },
};

/**
 * One "Shop by" group: its heading row (menu and filter switches, order,
 * edit and delete) over its items, each with its picture, address, product
 * count and its own order.
 */
export default function GroupCard({
  group, items, countOf, pathOf, canEdit, canDelete, first, last,
  onMove, onToggle, onEdit, onDelete, onMoveItem, onAddItem, onEditItem, onDeleteItem,
}) {
  const [open, setOpen] = useState(true);
  const kind = KINDS[group.kind];

  return (
    <section className="rounded-r-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 basis-full items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:basis-auto"
        >
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-4 transition-transform duration-200 ease-q", !open && "-rotate-90")} aria-hidden="true" />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">Shop by</span>
              <strong className="font-display text-[1.15rem] tracking-tight text-ink">{group.name}</strong>
              <span className="rounded-r-pill bg-brand-50 px-2 py-0.5 text-[.7rem] font-semibold text-brand-600">{kind.label}</span>
              {!group.active && <StatusChip status="hidden" label="Hidden" />}
            </span>
            <span className="mt-0.5 block text-[.8rem] text-ink-4">
              {kind.hint} · {items.length} {items.length === 1 ? kind.noun : `${kind.noun === "category" ? "categories" : `${kind.noun}s`}`}
            </span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Toggle checked={group.inMenu} onChange={(inMenu) => onToggle({ inMenu })} label="In the Shop menu" disabled={!canEdit} />
          <Toggle checked={group.inFilters} onChange={(inFilters) => onToggle({ inFilters })} label="Shop filter" disabled={!canEdit} />
        </div>

        {canEdit && (
          <div className="flex items-center">
            <button type="button" className="icon-btn" aria-label={`Move ${group.name} up`} disabled={first} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" className="icon-btn" aria-label={`Move ${group.name} down`} disabled={last} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
            <button type="button" className="icon-btn" aria-label={`Edit ${group.name}`} onClick={onEdit}><Pencil className="h-4 w-4" /></button>
            {/* The last slot is always there so every row lines up: delete, or a lock where deleting isn't allowed (Category, which every product needs). */}
            {canDelete && group.kind !== "category" ? (
              <button type="button" className="icon-btn text-warn" aria-label={`Delete ${group.name}`} onClick={onDelete}><Trash2 className="h-4 w-4" /></button>
            ) : (
              <button type="button" className="icon-btn text-ink-4" disabled title={group.kind === "category" ? "Every product needs a category, so this group stays" : "You can't delete this"} aria-label={group.kind === "category" ? `${group.name} can't be deleted: every product needs one` : `${group.name} can't be deleted`}><Lock className="h-4 w-4" /></button>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="border-t border-line">
          <ul className="m-0 list-none divide-y divide-line p-0">
            {items.map((x, i) => {
              const count = countOf(x);
              const path = pathOf(x);
              return (
                <li key={x.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-cream/60 sm:gap-4 sm:px-6">
                  {canEdit && (
                    <span className="flex flex-col">
                      <button type="button" className="icon-btn h-7 min-h-0" aria-label={`Move ${x.name} up`} disabled={i === 0} onClick={() => onMoveItem(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" className="icon-btn h-7 min-h-0" aria-label={`Move ${x.name} down`} disabled={i === items.length - 1} onClick={() => onMoveItem(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                    </span>
                  )}
                  {group.kind !== "edits" && (
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-r-md bg-cream-2 text-ink-4">
                      {x.photo ? <Photo photo={x.photo} label="" className="h-full w-full object-cover" /> : <Tag className="h-4 w-4" aria-hidden="true" />}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <strong className="font-display">{x.name}</strong>
                    {x.description && <p className="m-0 truncate text-sm text-ink-3">{x.description}</p>}
                    <p className="m-0 mt-0.5 text-[.78rem] text-ink-4">
                      <code className="text-brand-600">{path}</code>
                      {count !== null && <> · {count} {count === 1 ? "product" : "products"}</>}
                    </p>
                  </div>
                  {/* On a phone the status and actions take their own line under the name. */}
                  <div className="flex basis-full items-center justify-end gap-2 sm:basis-auto">
                    <StatusChip status={x.active ? "active" : "hidden"} label={x.active ? "In the shop" : "Hidden"} />
                    <a className="icon-btn" href={path} target="_blank" rel="noopener noreferrer" aria-label={`Open ${x.name} in the shop`}><ExternalLink className="h-4 w-4" /></a>
                    {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => onEditItem(x)}>Edit</button>}
                    {canDelete && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => onDeleteItem(x)}>Delete</button>}
                  </div>
                </li>
              );
            })}
          </ul>
          {!items.length && <p className="m-0 px-6 py-6 text-sm text-ink-3">Nothing in {group.name} yet.</p>}
          {canEdit && (
            <div className="border-t border-line px-4 py-3 sm:px-6">
              <button type="button" className="btn btn--soft min-h-10 px-4 text-sm" onClick={onAddItem}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add to {group.name}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
