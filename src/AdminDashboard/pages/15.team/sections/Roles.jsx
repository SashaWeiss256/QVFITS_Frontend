/* Roles */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { rolesResource, useCollection } from "@/store/tanstackStore/queries/admin";
import Drawer from "@/AdminDashboard/components/Drawer";
import PermissionMatrix from "./PermissionMatrix";

/**
 * Owner, Manager and Showroom staff come with the shop; add your own for
 * anyone in between (a photographer who only edits products, a bookkeeper
 * who only sees money). The owner always has everything.
 */
export default function Roles({ roles, modules, staff }) {
  const resource = useCollection(rolesResource);
  const { can, refresh } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can("team", "edit");
  // How many people hold a role, shown on its card.
  const people = (id) => staff.filter((s) => s.roleId === id).length;

  // Saving a role refreshes the signed-in person's session, in case it is their own role that changed.
  const save = async () => {
    if (editing.id) await resource.update(editing.id, editing);
    else await resource.create({ ...editing, id: editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    await refresh();
    setEditing(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canEdit && <Button onClick={() => setEditing({ name: "", description: "", permissions: { overview: ["view"] } })}><Plus className="h-4 w-4" aria-hidden="true" /> New role</Button>}
      </div>
      {/* Role Cards: the owner role can't be edited and a system role can't be deleted */}
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <li key={r.id} className="rounded-r-md border border-line bg-white p-4">
            <strong className="font-display">{r.name}</strong>
            <p className="m-0 mt-1 text-sm text-ink-3">{r.description}</p>
            <p className="m-0 mt-2 text-xs text-ink-3">{people(r.id)} {people(r.id) === 1 ? "person" : "people"} · {Object.values(r.permissions).filter((a) => a.length).length} of {modules.length} modules</p>
            <div className="mt-3 flex gap-2">
              {r.id !== "owner" && canEdit && <button type="button" className="btn btn--ghost min-h-9 px-3 text-xs" onClick={() => setEditing(r)}>Edit access</button>}
              {!r.system && can("team", "delete") && <button type="button" className="btn btn--ghost min-h-9 px-3 text-xs text-warn" onClick={() => setRemoving(r)}>Delete</button>}
            </div>
          </li>
        ))}
      </ul>
      {/* Role Drawer: a name, what it is for, and the permission matrix */}
      <Drawer
        open={Boolean(editing)}
        wide
        onClose={() => setEditing(null)}
        title={editing?.id ? `${editing.name} access` : "New role"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={resource.isSaving} disabled={!editing?.name.trim()}>Save role</Button></>}
      >
        {editing && (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={editing.name} disabled={editing.system} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Field label="What it is for" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <PermissionMatrix modules={modules} value={editing.permissions} onChange={(permissions) => setEditing({ ...editing, permissions })} />
          </div>
        )}
      </Drawer>
      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.name} loading={resource.isRemoving} onConfirm={() => resource.remove(removing.id).then(() => setRemoving(null)).catch(() => setRemoving(null))} />
    </>
  );
}
