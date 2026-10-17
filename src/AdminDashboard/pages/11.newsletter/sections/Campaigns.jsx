/* Newsletter Campaigns */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCampaigns, useSubscribers } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import CampaignEditor from "./CampaignEditor";

const BLANK = { subject: "", previewText: "", heading: "", body: "", productIds: [], cta: { label: "Shop now", target: {} } };
const STATE = { draft: ["draft", "Draft"], scheduled: ["pending", "Scheduled"], sent: ["active", "Sent"] };

/**
 * Emails to the list: write one, then send it now or schedule it. A sent
 * campaign is kept, locked, with how many it reached. Only confirmed
 * subscribers receive it, each with their own unsubscribe link.
 */
export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: subs = [] } = useSubscribers();
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const confirmed = subs.filter((s) => s.status === "subscribed").length;

  return (
    <>
      <PageHeader
        lede={`Emails to the ${confirmed} confirmed ${confirmed === 1 ? "subscriber" : "subscribers"}. Until an email service is connected, they land in the Outbox.`}
        action={can("newsletter", "edit") && <Button onClick={() => setEditing(BLANK)}><Plus className="h-4 w-4" aria-hidden="true" /> New campaign</Button>}
      />
      <Panel>
        <DataTable
          rows={campaigns}
          loading={isLoading}
          columns={[
            { key: "subject", label: "Subject", sort: (c) => c.subject, render: (c) => <span><strong>{c.subject}</strong>{c.previewText && <span className="block text-xs text-ink-3">{c.previewText}</span>}</span> },
            { key: "status", label: "Status", render: (c) => <StatusChip status={STATE[c.status][0]} label={STATE[c.status][1]} /> },
            { key: "when", label: "When", sort: (c) => c.sentAt ?? c.sendAt ?? c.updatedAt, render: (c) => (c.sentAt ? `Sent ${formatDateTime(c.sentAt)}` : c.sendAt ? `For ${formatDateTime(c.sendAt)}` : `Edited ${formatDateTime(c.updatedAt)}`) },
            { key: "recipients", label: "Reached", align: "right", render: (c) => (c.status === "sent" ? c.recipients : <span className="text-ink-4">-</span>) },
          ]}
          onRowClick={(c) => setEditing(c)}
          empty="No campaigns yet. Write the first: a new drop, a restock, an offer."
        />
      </Panel>
      {editing && <CampaignEditor key={editing.id ?? "new"} initial={editing} confirmed={confirmed} onClose={() => setEditing(null)} />}
    </>
  );
}
