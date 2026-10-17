/* Admin Products */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import {
  categoriesResource,
  productsResource,
  useBulkRemoveProducts,
  useBulkUpdateProducts,
  useCollection,
  useDuplicateProduct,
} from "@/store/tanstackStore/queries/admin";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

const total = (p) => p.variants.reduce((n, v) => n + v.stock, 0);
const STATUS = [{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }];
const STOCK = [{ value: "in", label: "In stock" }, { value: "low", label: "Low (2 or fewer)" }, { value: "out", label: "Sold out" }];

/**
 * The catalogue, drafts included. Search and filter, open a piece to edit
 * it, or tick several to publish, archive, label or put on sale at once.
 */
export default function AdminProducts() {
  const products = useCollection(productsResource);
  const categories = useCollection(categoriesResource);
  const bulkUpdate = useBulkUpdateProducts();
  const bulkRemove = useBulkRemoveProducts();
  const duplicate = useDuplicateProduct();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const canEdit = can("products", "edit");
  const canDelete = can("products", "delete");

  const columns = [
    {
      key: "name",
      label: "Product",
      sort: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="block h-14 w-11 flex-none overflow-hidden rounded-r-sm bg-sand-100">{p.photos[0] && <Photo photo={p.photos[0]} label={p.name} className="h-full rounded-none" />}</span>
          <span>
            <strong className="block font-display">{p.name}</strong>
            <span className="text-xs text-ink-3">{p.colors.join(", ")}</span>
          </span>
        </div>
      ),
    },
    { key: "category", label: "Category", sort: (p) => p.category },
    { key: "status", label: "Status", render: (p) => <StatusChip status={p.status} /> },
    { key: "badge", label: "Label", render: (p) => p.badge ?? <span className="text-ink-4">None</span> },
    { key: "stock", label: "Stock", align: "right", sort: total, render: (p) => (total(p) ? total(p) : <span className="font-semibold text-warn">Sold out</span>) },
    {
      key: "price",
      label: "Price",
      align: "right",
      sort: (p) => p.price,
      render: (p) => (p.salePercent ? <span><s className="text-ink-4">{moneyBase(p.price)}</s> {p.salePercent}% off</span> : moneyBase(p.price)),
    },
  ];

  const bulk = (patch) => (ids, clear) => bulkUpdate.mutateAsync({ ids, patch }).then(clear);

  return (
    <>
      <PageHeader
        lede={`${products.items.length} pieces. Drafts and archived pieces never show in the shop.`}
        action={canEdit && <Link className="btn btn--primary" to="/admin/products/new"><Plus className="h-4 w-4" aria-hidden="true" /> Add product</Link>}
      />
      <Panel>
        <DataTable
          rows={products.items}
          loading={products.isLoading}
          columns={columns}
          search={(p) => [p.name, p.category, ...p.colors, ...p.variants.map((v) => v.sku)].join(" ")}
          searchLabel="Search name, colour or SKU"
          filters={[
            { id: "status", label: "Status", options: STATUS, test: (p, v) => p.status === v },
            { id: "category", label: "Category", options: categories.items.map((c) => ({ value: c.id, label: c.name })), test: (p, v) => p.categoryId === v },
            { id: "stock", label: "Stock", options: STOCK, test: (p, v) => (v === "out" ? !total(p) : v === "low" ? p.variants.some((x) => x.stock > 0 && x.stock <= 2) : total(p) > 0) },
          ]}
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          bulkActions={
            canEdit &&
            ((ids, clear) => (
              <>
                <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => bulk({ status: "active" })(ids, clear)}>Publish</button>
                <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => bulk({ status: "archived" })(ids, clear)}>Archive</button>
                <select className="input min-h-9 py-1 text-xs" aria-label="Set label" value="" onChange={(e) => e.target.value && bulk({ badge: e.target.value === "none" ? null : e.target.value })(ids, clear)}>
                  <option value="">Set label…</option>
                  <option value="New">New</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="none">No label</option>
                </select>
                <select className="input min-h-9 py-1 text-xs" aria-label="Set sale" value="" onChange={(e) => e.target.value && bulk({ salePercent: Number(e.target.value) || null })(ids, clear)}>
                  <option value="">Sale…</option>
                  {[10, 15, 20, 25, 30, 40, 50].map((n) => <option key={n} value={n}>{n}% off</option>)}
                  <option value="0">End sale</option>
                </select>
                {canDelete && <button type="button" className="btn btn--danger min-h-9 px-3 text-xs" onClick={() => setDeleting({ ids, clear })}>Delete</button>}
              </>
            ))
          }
          rowActions={(p) => [
            { label: "Edit", onClick: () => navigate(`/admin/products/${p.id}`) },
            { label: "View in shop", onClick: () => window.open(`/product/${p.slug}`, "_blank", "noopener"), hidden: p.status !== "active" },
            { label: "Duplicate", onClick: () => duplicate.mutate(p.id), hidden: !canEdit },
            { label: p.status === "archived" ? "Restore" : "Archive", onClick: () => products.update(p.id, { status: p.status === "archived" ? "draft" : "archived" }), hidden: !canEdit },
            { label: "Delete", danger: true, onClick: () => setDeleting({ ids: [p.id], name: p.name }), hidden: !canDelete },
          ]}
          exportName="products"
          exportRow={(p) => ({ name: p.name, category: p.category, status: p.status, price: p.price, salePercent: p.salePercent ?? "", stock: total(p), colours: p.colors, badge: p.badge ?? "" })}
          empty="No products yet. Add the first one."
        />
      </Panel>
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemName={deleting?.name ?? `${deleting?.ids.length} products`}
        loading={bulkRemove.isPending}
        onConfirm={async () => {
          await bulkRemove.mutateAsync(deleting.ids);
          deleting.clear?.();
          setDeleting(null);
        }}
      />
    </>
  );
}
