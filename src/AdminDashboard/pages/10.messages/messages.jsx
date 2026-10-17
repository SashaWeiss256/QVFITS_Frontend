/* Admin Messages */
import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { messagesResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

// The states a message moves through: new, read, replied, archived.
const STATUSES = [{ value: "new", label: "New" }, { value: "read", label: "Read" }, { value: "replied", label: "Replied" }, { value: "archived", label: "Archived" }];

/**
 * Everything sent from the contact form. Reply on WhatsApp or by email from
 * here, then mark it replied so the team knows it is handled.
 */
export default function AdminMessages() {
  const messages = useCollection(messagesResource);
  const { can } = useAdminAuth();
  const [openId, setOpenId] = useState(null);
  const open = messages.items.find((m) => m.id === openId);
  const canEdit = can("messages", "edit");

  // Opening a new message marks it read, so the "new" count only holds ones nobody has seen.
  const openMessage = (m) => {
    setOpenId(m.id);
    if (m.status === "new" && canEdit) messages.update(m.id, { status: "read" });
  };

  return (
    <>
      {/* Page Header: how many are new */}
      <PageHeader lede={`${messages.items.filter((m) => m.status === "new").length} new from the contact form.`} />
      {/* Messages Table: new ones are bold */}
      <Panel>
        <DataTable
          rows={messages.items}
          loading={messages.isLoading}
          columns={[
            { key: "name", label: "From", render: (m) => <strong className={m.status === "new" ? "font-display" : "font-normal"}>{m.name}</strong> },
            { key: "topic", label: "About", render: (m) => m.topic ?? "" },
            { key: "message", label: "Message", render: (m) => <span className="line-clamp-1 max-w-md text-ink-3">{m.message}</span> },
            { key: "status", label: "Status", render: (m) => <StatusChip status={m.status} /> },
            { key: "createdAt", label: "Sent", sort: (m) => m.createdAt, render: (m) => formatDateTime(m.createdAt) },
          ]}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(m) => `${m.name} ${m.message} ${m.topic ?? ""}`}
          filters={[{ id: "status", label: "Status", options: STATUSES, test: (m, v) => m.status === v }]}
          onRowClick={openMessage}
          empty="No messages yet. The contact form sends them here."
        />
      </Panel>
      {/* Message Drawer: the message, then ways to answer it */}
      {open && (
        <Drawer
          open
          onClose={() => setOpenId(null)}
          title={open.name}
          subtitle={`${open.topic ?? "Message"} · ${formatDateTime(open.createdAt)}`}
          footer={canEdit && (
            <>
              <Button variant="ghost" onClick={() => messages.update(open.id, { status: "archived" }).then(() => setOpenId(null))}>Archive</Button>
              <Button onClick={() => messages.update(open.id, { status: "replied" })} disabled={open.status === "replied"}>Mark replied</Button>
            </>
          )}
        >
          <div className="mb-4"><StatusChip status={open.status} /></div>
          <p className="whitespace-pre-line rounded-r-md bg-white p-4 shadow-sh-1">{open.message}</p>
          {/* Reply: WhatsApp or email, whichever they left; with neither, they chose where to send it from the form */}
          <div className="mt-4 flex flex-wrap gap-2">
            {open.phone && <a className="btn btn--soft" href={whatsappLink(open.phone.replace(/\D/g, "").replace(/^0/, "256"), `Hi ${open.name.split(" ")[0]}, thanks for your message to QVFITS.`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
            {open.email && <a className="btn btn--soft" href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.topic ?? "your message"}`)}`}><Mail className="h-4 w-4" /> Email</a>}
            {!open.phone && !open.email && <p className="m-0 text-sm text-ink-3">They chose where to send it from the form, so the reply goes back on that channel.</p>}
          </div>
        </Drawer>
      )}
    </>
  );
}
