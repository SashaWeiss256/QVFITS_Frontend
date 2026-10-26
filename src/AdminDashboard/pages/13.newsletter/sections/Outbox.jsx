/* Email Outbox */
import { Link } from "react-router-dom";

import StatusChip from "@/components/ui/StatusChip";
import { useOutbox, useRetryEmail } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

const KIND = {
  "newsletter-confirm": "Newsletter confirmation",
  "newsletter-welcome": "Welcome email",
  campaign: "Campaign",
  "order-update": "Order update",
  "password-reset": "Password reset",
  "account-confirm": "Account confirmation",
  "low-stock": "Low stock alert",
  "staff-invite": "Team invite",
  "new-message": "New message",
};

// What happened to each email, short enough for the column; the page's intro explains Held and Phone only.
const STATUS = {
  queued: "Sending",
  sent: "Sent",
  failed: "Failed",
  held: "Held",
  no_email: "Phone only",
};

/**
 * Every email the shop sends, sent through Zoho Mail by the API's queue, with
 * what happened to each. One that failed, or was held before the mailbox was
 * set up, can be sent again.
 */
export default function Outbox() {
  const { data: mail = [], isLoading } = useOutbox();
  const retry = useRetryEmail();
  return (
    <>
      <PageHeader lede="Every email the shop sends, and whether it went. A failed one is tried again a few times on its own, and you can send it again from here. Held: no mailbox was set up when it was written. Phone only: the customer left no email, so send it on WhatsApp." />
      <Panel>
        <DataTable
          filterDrawer
          rows={mail}
          loading={isLoading}
          columns={[
            { key: "createdAt", label: "When", sort: (m) => m.createdAt, render: (m) => formatDateTime(m.createdAt) },
            { key: "to", label: "To", sort: (m) => m.to },
            { key: "kind", label: "Kind", render: (m) => KIND[m.kind] ?? m.kind },
            { key: "subject", label: "Email", render: (m) => <span><strong>{m.subject}</strong><span className="block max-w-[38ch] truncate text-xs text-ink-3">{m.body}</span></span> },
            { key: "status", label: "Status", sort: (m) => m.status, render: (m) => <span title={m.error ?? undefined}><StatusChip status={m.status} label={STATUS[m.status] ?? m.status} />{m.error && m.status !== "no_email" && <span className="mt-1 block max-w-[28ch] truncate text-xs text-ink-3">{m.error}</span>}</span> },
            { key: "link", label: "Link", render: (m) => (m.link ? <Link to={m.link} className="text-brand-600 underline" target="_blank">Open</Link> : m.ref ? m.ref : <span className="text-ink-4">-</span>) },
          ]}
          rowActions={(m) => [{ label: "Send again", onClick: () => retry.mutate(m.id), hidden: !["failed", "held"].includes(m.status) }]}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(m) => `${m.to} ${m.subject} ${m.ref ?? ""}`}
          searchLabel="Search address, subject or order"
          filters={[
            { id: "kind", label: "Kind", options: Object.entries(KIND).map(([value, label]) => ({ value, label })), test: (m, v) => m.kind === v },
            { id: "status", label: "Status", options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), test: (m, v) => m.status === v },
          ]}
          empty="No emails yet."
        />
      </Panel>
    </>
  );
}
