/* Admin Reviews */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { productsResource, reviewsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

const STATUS = [{ value: "pending", label: "Waiting" }, { value: "approved", label: "Approved" }, { value: "hidden", label: "Hidden" }];
const BLANK = { name: "", text: "", stars: 5, productId: "", status: "approved" };

/**
 * Reviews wait here until someone approves them; only approved ones show on
 * the shop. Quotes from WhatsApp or Instagram can be added by hand, word for
 * word, with the customer's permission.
 */
export default function AdminReviews() {
  const reviews = useCollection(reviewsResource);
  const products = useCollection(productsResource);
  const { can } = useAdminAuth();
  const [adding, setAdding] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can("products", "edit");
  const productName = (id) => products.items.find((p) => p.id === id)?.name;

  const columns = [
    { key: "name", label: "From", sort: (r) => r.name, render: (r) => <strong>{r.name}</strong> },
    { key: "text", label: "Review", render: (r) => <span className="line-clamp-2 max-w-md">{"★".repeat(r.stars ?? 0)} {r.text}</span> },
    { key: "product", label: "Piece", render: (r) => productName(r.productId) ?? <span className="text-ink-4">The shop</span> },
    { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} label={r.status === "pending" ? "Waiting" : undefined} /> },
    { key: "createdAt", label: "Date", sort: (r) => r.createdAt, render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <PageHeader
        lede={`${reviews.items.filter((r) => r.status === "pending").length} waiting for approval.`}
        action={canEdit && <Button onClick={() => setAdding(BLANK)}><Plus className="h-4 w-4" aria-hidden="true" /> Add review</Button>}
      />
      <Panel>
        <DataTable
          rows={reviews.items}
          loading={reviews.isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(r) => `${r.name} ${r.text}`}
          filters={[{ id: "status", label: "Status", options: STATUS, test: (r, v) => r.status === v }]}
          bulkActions={canEdit && ((ids, clear) => (
            <>
              <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => Promise.all(ids.map((id) => reviews.update(id, { status: "approved" }))).then(clear)}>Approve</button>
              <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => Promise.all(ids.map((id) => reviews.update(id, { status: "hidden" }))).then(clear)}>Hide</button>
            </>
          ))}
          rowActions={(r) => [
            { label: "Approve", onClick: () => reviews.update(r.id, { status: "approved" }), hidden: !canEdit || r.status === "approved" },
            { label: "Hide", onClick: () => reviews.update(r.id, { status: "hidden" }), hidden: !canEdit || r.status === "hidden" },
            { label: "Delete", danger: true, onClick: () => setRemoving(r), hidden: !can("products", "delete") },
          ]}
          empty="No reviews yet."
        />
      </Panel>

      <Modal
        isOpen={Boolean(adding)}
        onClose={() => setAdding(null)}
        title="Add a review"
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button><Button loading={reviews.isSaving} disabled={!adding?.name.trim() || !adding?.text.trim()} onClick={() => reviews.create({ ...adding, productId: adding.productId || null }).then(() => setAdding(null))}>Save</Button></div>}
      >
        {adding && (
          <div className="grid gap-4">
            <Field label="Their name" value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value })} />
            <Field label="What they said" as="textarea" rows={4} value={adding.text} onChange={(e) => setAdding({ ...adding, text: e.target.value })} hint="Word for word. Do not tidy it up." />
            <Field label="Stars" options={[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} of 5` }))} value={adding.stars} onChange={(e) => setAdding({ ...adding, stars: Number(e.target.value) })} />
            <Field label="About" options={[{ value: "", label: "The shop in general" }, ...products.items.map((p) => ({ value: p.id, label: p.name }))]} value={adding.productId} onChange={(e) => setAdding({ ...adding, productId: e.target.value })} />
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing && `the review from ${removing.name}`} loading={reviews.isRemoving} onConfirm={() => reviews.remove(removing.id).then(() => setRemoving(null))} />
    </>
  );
}
