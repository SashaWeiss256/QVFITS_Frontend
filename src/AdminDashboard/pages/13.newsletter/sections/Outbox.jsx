/* Email Outbox */
import { Link } from "react-router-dom";

import { useOutbox } from "@/store/tanstackStore/queries/admin";
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
};

/**
 * Honest seam: no email service is connected yet, so every email the shop
 * would send waits here instead. Once Brevo or Mailchimp is connected these
 * go out for real and this becomes a sending log.
 */
export default function Outbox() {
  const { data: mail = [], isLoading } = useOutbox();
  return (
    <>
      <PageHeader lede="Every email the shop would have sent. Nothing leaves until an email service is connected; the links work here so each flow can be checked." />
      <Panel>
        <DataTable
          filterDrawer
          rows={mail}
          loading={isLoading}
          columns={[
            { key: "createdAt", label: "When", sort: (m) => m.createdAt, render: (m) => formatDateTime(m.createdAt) },
            { key: "to", label: "To", sort: (m) => m.to },
            { key: "kind", label: "Kind", render: (m) => KIND[m.kind] ?? m.kind },
            { key: "subject", label: "Email", render: (m) => <span><strong>{m.subject}</strong><span className="block max-w-[52ch] truncate text-xs text-ink-3">{m.body}</span></span> },
            { key: "link", label: "Link", render: (m) => (m.link ? <Link to={m.link} className="text-brand-600 underline" target="_blank">Open</Link> : m.ref ? m.ref : <span className="text-ink-4">-</span>) },
          ]}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(m) => `${m.to} ${m.subject} ${m.ref ?? ""}`}
          searchLabel="Search address, subject or order"
          filters={[{ id: "kind", label: "Kind", options: Object.entries(KIND).map(([value, label]) => ({ value, label })), test: (m, v) => m.kind === v }]}
          empty="Nothing queued yet."
        />
      </Panel>
    </>
  );
}
