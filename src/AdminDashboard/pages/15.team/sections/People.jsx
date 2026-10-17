/* People */
import { useState } from "react";
import { Copy, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { notify } from "@/store/tanstackStore/notices";
import { staffResource, useCollection, useInviteStaff } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PermissionMatrix from "./PermissionMatrix";

/**
 * Everyone who can sign in to the admin. Invite by email (the link is shown
 * to share until the server sends email), change a role, pause access, or
 * give one person more or less than their role.
 */
export default function People({ roles, modules }) {
  const staff = useCollection(staffResource);
  const invite = useInviteStaff();
  const { admin, can, refresh } = useAdminAuth();
  const [inviting, setInviting] = useState(null);
  const [link, setLink] = useState("");
  const [openId, setOpenId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [removing, setRemoving] = useState(null);
  const canEdit = can("team", "edit");
  // A person's role, looked up by id (the owner role can't be changed here).
  const roleOf = (id) => roles.find((r) => r.id === id);
  const open = staff.items.find((s) => s.id === openId);

  // Saving your own row refreshes your session, so the sidebar and permissions follow at once.
  const update = async (id, patch) => {
    await staff.update(id, patch);
    if (id === admin.id) refresh();
  };

  // Inviting hands back a link to share, because no email service is connected yet (the honest seam).
  const sendInvite = async () => {
    const out = await invite.mutateAsync(inviting).catch(() => null);
    if (out) setLink(out.inviteLink);
  };

  // What someone can really do: their role's permissions with their own overrides on top.
  const effective = (s) => ({ ...(roleOf(s.roleId)?.permissions ?? {}), ...s.overrides });

  return (
    <>
      {/* Invite Button */}
      <div className="mb-4 flex justify-end">
        {canEdit && <Button onClick={() => { setInviting({ name: "", email: "", roleId: "staff" }); setLink(""); }}><Plus className="h-4 w-4" aria-hidden="true" /> Invite someone</Button>}
      </div>
      {/* Team Table: change a role in the row, or use the row menu for access, pause and remove */}
      <DataTable
        rows={staff.items}
        loading={staff.isLoading}
        columns={[
          { key: "name", label: "Name", sort: (s) => s.name, render: (s) => <span><strong className="font-display">{s.name}</strong>{s.id === admin.id && <span className="ml-2 text-xs text-ink-3">(you)</span>}<span className="block text-xs text-ink-3">{s.email}</span></span> },
          {
            key: "role",
            label: "Role",
            render: (s) => canEdit ? (
              <select className="select min-h-9 py-1 text-sm" aria-label={`Role for ${s.name}`} value={s.roleId} onChange={(e) => update(s.id, { roleId: e.target.value })}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            ) : roleOf(s.roleId)?.name,
          },
          { key: "extra", label: "Own access", render: (s) => (Object.keys(s.overrides ?? {}).length ? <span className="text-sm text-brand-600">{Object.keys(s.overrides).length} changes</span> : <span className="text-sm text-ink-4">As role</span>) },
          { key: "status", label: "Status", render: (s) => <StatusChip status={s.status} /> },
          { key: "lastSeenAt", label: "Last signed in", sort: (s) => s.lastSeenAt ?? "", render: (s) => (s.lastSeenAt ? formatDate(s.lastSeenAt) : <span className="text-ink-4">Never</span>) },
        ]}
        rowActions={(s) => [
          { label: "Change their access", onClick: () => { setOpenId(s.id); setOverrides(effective(s)); }, hidden: !canEdit || s.roleId === "owner" },
          { label: s.status === "suspended" ? "Restore access" : "Pause access", onClick: () => update(s.id, { status: s.status === "suspended" ? "active" : "suspended" }), hidden: !canEdit || s.status === "invited" || s.id === admin.id },
          { label: "Remove from team", danger: true, onClick: () => setRemoving(s), hidden: !can("team", "delete") || s.id === admin.id },
        ]}
      />

      {/* Invite Dialog: the form first, then the link to send once it is made */}
      <Modal
        isOpen={Boolean(inviting)}
        onClose={() => setInviting(null)}
        title="Invite someone"
        size="sm"
        footer={!link && <div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setInviting(null)}>Cancel</Button><Button onClick={sendInvite} loading={invite.isPending} disabled={!inviting?.name.trim() || !/\S+@\S+\.\S+/.test(inviting?.email ?? "")}>Create invite</Button></div>}
      >
        {inviting && !link && (
          <div className="grid gap-4">
            <Field label="Name" value={inviting.name} onChange={(e) => setInviting({ ...inviting, name: e.target.value })} />
            <Field label="Email" type="email" value={inviting.email} onChange={(e) => setInviting({ ...inviting, email: e.target.value })} />
            <Field label="Role" options={roles.map((r) => ({ value: r.id, label: r.name }))} value={inviting.roleId} onChange={(e) => setInviting({ ...inviting, roleId: e.target.value })} hint={roleOf(inviting.roleId)?.description} />
          </div>
        )}
        {link && (
          <div className="grid gap-3">
            <p className="m-0">Send {inviting?.name.split(" ")[0]} this link. It lets them set a password and sign in.</p>
            <code className="block rounded-r-sm bg-white p-3 text-xs break-all">{link}</code>
            <Button variant="soft" onClick={() => navigator.clipboard.writeText(link).then(() => notify("Link copied", { tone: "success" }))}><Copy className="h-4 w-4" /> Copy link</Button>
            <p className="m-0 text-xs text-ink-3">Once the server sends email, the invite goes out by itself.</p>
          </div>
        )}
      </Modal>

      {/* Access Drawer: the permission matrix for one person. Only what differs from their role is saved as overrides. */}
      {open && (
        <Drawer
          open
          wide
          onClose={() => setOpenId(null)}
          title={`${open.name}'s access`}
          subtitle={`Role: ${roleOf(open.roleId)?.name}. Highlighted rows differ from the role.`}
          footer={
            <>
              <Button variant="ghost" onClick={() => update(open.id, { overrides: {} }).then(() => setOpenId(null))}>Reset to role</Button>
              <Button loading={staff.isSaving} onClick={() => {
                const base = roleOf(open.roleId)?.permissions ?? {};
                const diff = Object.fromEntries(Object.entries(overrides).filter(([k, v]) => JSON.stringify([...v].sort()) !== JSON.stringify([...(base[k] ?? [])].sort())));
                update(open.id, { overrides: diff }).then(() => setOpenId(null));
              }}>Save access</Button>
            </>
          }
        >
          <PermissionMatrix modules={modules} value={overrides} onChange={setOverrides} base={roleOf(open.roleId)?.permissions} />
        </Drawer>
      )}

      {/* Remove Confirmation */}
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.name} confirmLabel="Remove" loading={staff.isRemoving} onConfirm={() => staff.remove(removing.id).then(() => setRemoving(null)).catch(() => setRemoving(null))} />
    </>
  );
}
