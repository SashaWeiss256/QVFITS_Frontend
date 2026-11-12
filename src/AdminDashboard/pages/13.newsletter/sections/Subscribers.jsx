/* Newsletter Subscribers */
import { useState } from "react";
import { MailCheck, MailQuestion, MailX, UserPlus } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useEraseSubscriber, useSubscribers, useUnsubscribeSubscriber } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";
import { SplitBar, StatRow } from "../parts";

const STATUS = [{ value: "subscribed", label: "Subscribed" }, { value: "pending", label: "Awaiting confirmation" }, { value: "unsubscribed", label: "Unsubscribed" }];
const SOURCE = { footer: "Footer", home: "Home page", checkout: "Checkout", account: "Their account", resubscribe: "Rejoined" };
const MONTH = 30 * 86_400_000;

/**
 * Everyone who joined, with the consent they gave. Nobody is added by hand:
 * joining is double opt-in from the shop. Unsubscribe keeps the record so
 * the address is never mailed again; Erase deletes it for a privacy request.
 */
export default function Subscribers() {
  const { data: subs = [], isLoading } = useSubscribers();
  const unsubscribe = useUnsubscribeSubscriber();
  const erase = useEraseSubscriber();
  const { can } = useAdminAuth();
  const [pending, setPending] = useState(null);
  // "Joined in 30 days" counts from when the page opened.
  const [now] = useState(() => Date.now());
  const count = (s) => subs.filter((x) => x.status === s).length;

  return (
    <>
      <PageHeader lede="Everyone who joined from the shop. Only confirmed subscribers get campaigns; the rest are waiting to tap the link we emailed." />
      <StatRow label="The list">
        <StatCard label="Subscribed" icon={MailCheck} loading={isLoading} value={count("subscribed")} note="Get every campaign" />
        <StatCard label="Awaiting confirmation" icon={MailQuestion} loading={isLoading} value={count("pending")} note="Haven't tapped the link yet" />
        <StatCard label="Unsubscribed" icon={MailX} loading={isLoading} value={count("unsubscribed")} note="Never mailed again" />
        <StatCard label="Joined in 30 days" icon={UserPlus} loading={isLoading} value={subs.filter((s) => now - Date.parse(s.createdAt) < MONTH).length} note="New this month" />
      </StatRow>
      {/* How the list divides, at a glance */}
      {subs.length > 0 && (
        <Panel title="List health" hint="Confirmed addresses are your real audience. A large awaiting group usually means the confirmation email is not reaching people." className="mb-6">
          <SplitBar parts={[
            { label: "Subscribed", value: count("subscribed"), className: "bg-brand-grad" },
            { label: "Awaiting confirmation", value: count("pending"), className: "bg-brand-200" },
            { label: "Unsubscribed", value: count("unsubscribed"), className: "bg-line-2" },
          ]} />
        </Panel>
      )}
      <Panel title="Everyone on the list" hint="Open the filters to narrow by status or where they joined. Export downloads the confirmed addresses." flush={false}>
        <DataTable
          filterDrawer
          rows={subs}
          loading={isLoading}
          columns={[
            { key: "email", label: "Subscriber", sort: (s) => s.email, render: (s) => <span><strong>{s.email}</strong>{s.name && <span className="block text-xs text-ink-3">{s.name}</span>}</span> },
            { key: "status", label: "Status", render: (s) => <StatusChip status={s.status === "subscribed" ? "active" : s.status === "pending" ? "pending" : "inactive"} label={STATUS.find((x) => x.value === s.status)?.label} /> },
            { key: "source", label: "Joined from", render: (s) => SOURCE[s.source] ?? s.source },
            { key: "consentedAt", label: "Consent given", sort: (s) => s.consentedAt, render: (s) => <span title={s.consentText}>{formatDate(s.consentedAt)}</span> },
            { key: "confirmedAt", label: "Confirmed", sort: (s) => s.confirmedAt ?? "", render: (s) => (s.confirmedAt ? formatDate(s.confirmedAt) : <span className="text-ink-4">Not yet</span>) },
          ]}
          initialSort={{ key: "consentedAt", dir: "desc" }}
          search={(s) => `${s.email} ${s.name ?? ""}`}
          searchLabel="Search email or name"
          filters={[
            { id: "status", label: "Status", options: STATUS, test: (s, v) => s.status === v },
            { id: "source", label: "Joined from", options: Object.entries(SOURCE).map(([value, label]) => ({ value, label })), test: (s, v) => s.source === v },
          ]}
          rowActions={(s) => [
            { label: "Unsubscribe", onClick: () => setPending({ kind: "unsubscribe", s }), hidden: s.status === "unsubscribed" || !can("newsletter", "edit") },
            { label: "Erase (privacy request)", danger: true, onClick: () => setPending({ kind: "erase", s }), hidden: !can("newsletter", "delete") },
          ]}
          exportName="newsletter-subscribed"
          exportRow={(s) => (s.status === "subscribed" ? { email: s.email, name: s.name ?? "", source: s.source, consentedAt: s.consentedAt, confirmedAt: s.confirmedAt } : null)}
          empty="Nobody yet. Sign-ups from the footer and the home page land here."
        />
      </Panel>
      <ConfirmDialog
        isOpen={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending?.kind === "erase" ? "Erase this subscriber?" : "Unsubscribe them?"}
        itemName={pending?.s.email}
        confirmLabel={pending?.kind === "erase" ? "Erase" : "Unsubscribe"}
        loading={unsubscribe.isPending || erase.isPending}
        onConfirm={async () => {
          await (pending.kind === "erase" ? erase : unsubscribe).mutateAsync(pending.s.id);
          setPending(null);
        }}
      />
    </>
  );
}
