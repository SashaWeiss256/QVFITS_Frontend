/* Admin Newsletter */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { subscribersResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { MARKETING_TABS } from "@/AdminDashboard/lib/constants";

/**
 * Everyone who joined the list from the home page. Honest seam: nothing is
 * emailed from here yet; export the list into Brevo or Mailchimp.
 */
export default function AdminNewsletter() {
  const subs = useCollection(subscribersResource);
  const { can } = useAdminAuth();
  const [adding, setAdding] = useState(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adding ?? "");

  return (
    <>
      <PageHeader
        title="Newsletter"
        lede={`${subs.items.length} on the list. Export it into your email tool to send.`}
        action={can("newsletter", "edit") && <Button onClick={() => setAdding("")}><Plus className="h-4 w-4" aria-hidden="true" /> Add someone</Button>}
      />
      <AdminNavTabs tabs={MARKETING_TABS} />
      <Panel>
        <DataTable
          rows={subs.items}
          loading={subs.isLoading}
          columns={[
            { key: "email", label: "Email", sort: (s) => s.email },
            { key: "createdAt", label: "Joined", sort: (s) => s.createdAt, render: (s) => formatDate(s.createdAt) },
          ]}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(s) => s.email}
          bulkActions={can("newsletter", "delete") && ((ids, clear) => (
            <button type="button" className="btn btn--danger min-h-9 px-3 text-xs" onClick={() => Promise.all(ids.map((id) => subs.remove(id))).then(clear)}>Remove</button>
          ))}
          exportName="newsletter"
          exportRow={(s) => ({ email: s.email, joined: s.createdAt.slice(0, 10) })}
          empty="Nobody yet. Sign-ups from the home page land here."
        />
      </Panel>
      <Modal
        isOpen={adding !== null}
        onClose={() => setAdding(null)}
        title="Add to the list"
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button><Button disabled={!valid} loading={subs.isSaving} onClick={() => subs.create({ email: adding }).then(() => setAdding(null))}>Add</Button></div>}
      >
        <Field label="Email" type="email" value={adding ?? ""} onChange={(e) => setAdding(e.target.value)} hint="Only with their permission." />
      </Modal>
    </>
  );
}
