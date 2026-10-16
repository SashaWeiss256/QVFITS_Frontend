/* Admin Categories */
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { categoriesResource, productsResource, useCollection, useReassignCategory } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { CATALOG_TABS } from "@/AdminDashboard/lib/constants";

const EMPTY = { name: "", description: "", active: true };

/**
 * The shop's categories, in the order the menus, footer and filters show
 * them. Turning one off hides it from the shop without touching its
 * products. A category with products moves them elsewhere before it goes.
 */
export default function AdminCategories() {
  const categories = useCollection(categoriesResource);
  const products = useCollection(productsResource);
  const reassign = useReassignCategory();
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [moveTo, setMoveTo] = useState("");
  const canEdit = can("categories", "edit");
  const list = categories.items;
  const count = (id) => products.items.filter((p) => p.categoryId === id).length;

  const move = (i, by) => {
    const ids = list.map((c) => c.id);
    const [id] = ids.splice(i, 1);
    ids.splice(i + by, 0, id);
    categories.reorder(ids);
  };

  const save = async () => {
    if (!editing.name.trim()) return;
    if (editing.id) await categories.update(editing.id, editing);
    else await categories.create(editing);
    setEditing(null);
  };

  const remove = async () => {
    if (count(removing.id) && moveTo) await reassign.mutateAsync({ from: removing.id, to: moveTo });
    await categories.remove(removing.id);
    setRemoving(null);
    setMoveTo("");
  };

  return (
    <>
      <PageHeader
        title="Categories"
        lede="The order here is the order in the menus, footer and shop filters."
        action={canEdit && <Button onClick={() => setEditing(EMPTY)}><Plus className="h-4 w-4" aria-hidden="true" /> Add category</Button>}
      />
      <AdminNavTabs tabs={CATALOG_TABS} />
      <Panel>
        <ul className="m-0 list-none p-0">
          {list.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
              {canEdit && (
                <span className="flex flex-col">
                  <button type="button" className="icon-btn h-7 min-h-0" aria-label={`Move ${c.name} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className="icon-btn h-7 min-h-0" aria-label={`Move ${c.name} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                </span>
              )}
              <div className="min-w-0 flex-1">
                <strong className="font-display">{c.name}</strong>
                <p className="m-0 text-sm text-ink-3">{c.description || "No description"} · {count(c.id)} products</p>
              </div>
              <StatusChip status={c.active ? "active" : "hidden"} label={c.active ? "In the shop" : "Hidden"} />
              {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => setEditing(c)}>Edit</button>}
              {can("categories", "delete") && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => setRemoving(c)}>Delete</button>}
            </li>
          ))}
        </ul>
        {!list.length && !categories.isLoading && <p className="py-8 text-center text-ink-3">No categories yet.</p>}
      </Panel>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${editing.name}` : "New category"}
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={categories.isSaving} disabled={!editing?.name.trim()}>Save</Button></div>}
      >
        {editing && (
          <div className="grid gap-4">
            <Field label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} autoFocus />
            <Field label="Description" as="textarea" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Toggle checked={editing.active} onChange={(active) => setEditing({ ...editing, active })} label="Show in the shop" hint="Off hides it from menus and filters; its products stay." />
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(removing)} onClose={() => setRemoving(null)} title={`Delete ${removing?.name ?? ""}`} size="sm">
        {removing && (
          <div className="grid gap-4">
            {count(removing.id) ? (
              <>
                <p className="m-0 text-ink-2">{count(removing.id)} products are in this category. Move them first:</p>
                <Field label="Move them to" options={[{ value: "", label: "Pick a category" }, ...list.filter((c) => c.id !== removing.id).map((c) => ({ value: c.id, label: c.name }))]} value={moveTo} onChange={(e) => setMoveTo(e.target.value)} />
              </>
            ) : (
              <p className="m-0 text-ink-2">Nothing is in this category. It can go straight away.</p>
            )}
            <Button variant="danger" block onClick={remove} loading={categories.isRemoving || reassign.isPending} disabled={count(removing.id) > 0 && !moveTo}>Delete category</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
