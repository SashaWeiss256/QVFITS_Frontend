/* Admin Customers */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { customersResource, useCollection, useOrders, useSubscribers } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import TagInput from "@/AdminDashboard/components/TagInput";

/**
 * Shoppers with an account, with what they have bought and spent. Staff
 * add private notes and tags (VIP, wholesale…); the shopper owns their own
 * name and addresses. Guest checkouts show on Orders.
 */
export default function AdminCustomers() {
  const customers = useCollection(customersResource);
  const { data: orders = [] } = useOrders();
  const { data: subscribers = [] } = useSubscribers();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [erasing, setErasing] = useState(false);

  // Each row carries the account's orders (cancelled and refunded ones don't count towards what they spent) and whether their email is a confirmed newsletter subscriber.
  const rows = useMemo(() => customers.items.map((c) => {
    const mine = orders.filter((o) => o.customerId === c.id && !["cancelled", "refunded"].includes(o.status));
    return { ...c, orders: mine, spent: mine.reduce((n, o) => n + o.total, 0), subscribed: subscribers.some((s) => s.email === c.email && s.status === "subscribed") };
  }), [customers.items, orders, subscribers]);
  const open = rows.find((c) => c.id === openId);
  // Every tag in use, so the Tag filter only lists real ones.
  const tags = [...new Set(rows.flatMap((c) => c.tags ?? []))];

  // The table's columns: name with tags, contact, orders, what they have spent, and when they joined.
  const columns = [
    { key: "name", label: "Name", sort: (c) => c.name, render: (c) => <span><strong className="font-display">{c.name}</strong>{c.tags?.length > 0 && <span className="block text-xs text-brand-600">{c.tags.join(", ")}</span>}</span> },
    { key: "email", label: "Contact", render: (c) => <span>{c.email}<span className="block text-xs text-ink-3">{c.phone || "No phone"}</span></span> },
    { key: "orders", label: "Orders", align: "right", sort: (c) => c.orders.length, render: (c) => c.orders.length },
    { key: "spent", label: "Spent", align: "right", sort: (c) => c.spent, render: (c) => moneyBase(c.spent) },
    { key: "createdAt", label: "Joined", sort: (c) => c.createdAt, render: (c) => formatDate(c.createdAt) },
  ];

  // Opening a customer starts a draft of the two things staff may change: notes and tags.
  const openCustomer = (c) => { setOpenId(c.id); setDraft({ notes: c.notes ?? "", tags: c.tags ?? [] }); };

  return (
    <>
      {/* Page Header */}
      <PageHeader lede={`${rows.length} accounts. Guests appear on their orders.`} />
      {/* Customer Table */}
      <Panel>
        <DataTable
          rows={rows}
          loading={customers.isLoading}
          columns={columns}
          search={(c) => `${c.name} ${c.email} ${c.phone ?? ""} ${(c.tags ?? []).join(" ")}`}
          filters={[
            ...(tags.length ? [{ id: "tag", label: "Tag", options: tags.map((t) => ({ value: t, label: t })), test: (c, v) => (c.tags ?? []).includes(v) }] : []),
            { id: "news", label: "Newsletter", options: [{ value: "yes", label: "Subscribed" }, { value: "no", label: "Not subscribed" }], test: (c, v) => c.subscribed === (v === "yes") },
          ]}
          onRowClick={openCustomer}
          exportName="customers"
          exportRow={(c) => ({ name: c.name, email: c.email, phone: c.phone ?? "", orders: c.orders.length, spent: c.spent, newsletter: c.subscribed ? "yes" : "no", tags: c.tags ?? [], joined: c.createdAt.slice(0, 10) })}
          empty="No accounts yet."
        />
      </Panel>
      {/* Customer Drawer: totals, contact, addresses and orders, then notes and tags only staff see */}
      {open && draft && (
        <Drawer
          open
          onClose={() => setOpenId(null)}
          title={open.name}
          subtitle={`Joined ${formatDate(open.createdAt)}`}
          footer={can("customers", "edit") && <Button loading={customers.isSaving} onClick={() => customers.update(open.id, draft)}>Save notes</Button>}
        >
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-white p-4 shadow-sh-1"><p className="eyebrow m-0">Orders</p><p className="m-0 mt-1 text-xl font-bold">{open.orders.length}</p></div>
            <div className="rounded-[14px] bg-white p-4 shadow-sh-1"><p className="eyebrow m-0">Spent</p><p className="m-0 mt-1 text-xl font-bold">{moneyBase(open.spent)}</p></div>
          </div>
          <p className="text-sm">{open.email}<br />{open.phone || "No phone"}<br />Newsletter: {open.subscribed ? "subscribed" : "not subscribed"}</p>
          {open.addresses.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 text-base">Addresses</h3>
              <ul className="m-0 list-none p-0 text-sm">{open.addresses.map((a) => <li key={a.id} className="mb-2"><strong>{a.label}</strong>: {a.address}</li>)}</ul>
            </>
          )}
          <h3 className="mt-5 mb-2 text-base">Orders</h3>
          {open.orders.length ? (
            <ul className="m-0 list-none p-0">
              {open.orders.map((o) => <li key={o.id} className="flex items-center justify-between gap-2 border-b border-line py-2 text-sm"><Link to={`/admin/orders?order=${o.id}`} className="text-brand-600 underline">{o.ref}</Link><span className="text-ink-3">{formatDate(o.createdAt)}</span><StatusChip status={o.status} /><span>{moneyBase(o.total)}</span></li>)}
            </ul>
          ) : <p className="text-sm text-ink-3">No orders yet.</p>}
          {/* Notes and tags: read-only without the edit permission */}
          <fieldset disabled={!can("customers", "edit")} className="m-0 mt-6 grid gap-4 border-0 p-0">
            <Field label="Tags">{(id) => <TagInput id={id} value={draft.tags} onChange={(t) => setDraft({ ...draft, tags: t })} placeholder="VIP, wholesale…" />}</Field>
            <Field label="Private notes" as="textarea" rows={4} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} hint="Only staff see these." />
          </fieldset>
          {/* Erase: for a data-deletion request (Uganda's Data Protection and Privacy Act, 2019). The orders stay for the books, without the name or contact details. */}
          {can("customers", "delete") && (
            <div className="mt-8 border-t border-line pt-5">
              <h3 className="m-0 text-base">Erase this customer</h3>
              <p className="m-0 mt-1 text-sm text-ink-3">For a request to delete their data, made by phone or in the showroom. The account, addresses, saved pieces and newsletter subscription go; orders stay for the books without their name or contact details.</p>
              <Button variant="danger" className="mt-3" onClick={() => setErasing(true)}>Erase customer</Button>
            </div>
          )}
        </Drawer>
      )}
      {/* Erase Confirmation */}
      <ConfirmDialog
        isOpen={erasing}
        onClose={() => setErasing(false)}
        title="Erase this customer?"
        itemName={open?.name}
        confirmLabel="Erase customer"
        loading={customers.isRemoving}
        onConfirm={() => customers.remove(open.id).then(() => { setErasing(false); setOpenId(null); }).catch(() => {})}
      />
    </>
  );
}
