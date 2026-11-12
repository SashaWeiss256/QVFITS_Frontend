/* Product List */
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
  colorsResource,
  groupsResource,
  productsResource,
  settingsResource,
  sizesResource,
  termsResource,
  useBulkRemoveProducts,
  useBulkUpdateProducts,
  useCollection,
  useDocument,
  useDuplicateProduct,
} from "@/store/tanstackStore/queries/admin";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SetupChecklist from "./SetupChecklist";

// Units on the shelf: every colour and size of a piece added together.
const units = (p) => p.variants.reduce((n, v) => n + v.stock, 0);
const TYPE = [{ value: "piece", label: "Single pieces" }, { value: "kit", label: "Kits" }];
const STATUS = [{ value: "active", label: "Published" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }];
// The labels a product can be filtered by; New, Best seller and Pinned map to the fields saved on the product form.
const LABELS = [
  { value: "new", label: "New arrival" },
  { value: "bestseller", label: "Best seller (sales or pinned)" },
  { value: "pinned", label: "Pinned best seller" },
  { value: "sale", label: "On sale" },
];

/**
 * The catalogue, drafts and kits included. Search, filter in the drawer,
 * open a piece to edit it, or tick several to publish, archive, label or
 * put on sale at once. Nothing can be added until the catalogue is set up.
 */
export default function ProductList() {
  const products = useCollection(productsResource);
  const categories = useCollection(categoriesResource);
  const colors = useCollection(colorsResource);
  const sizes = useCollection(sizesResource);
  const groups = useCollection(groupsResource).items.filter((g) => g.kind === "tags");
  const terms = useCollection(termsResource).items;
  const { data: settings } = useDocument(settingsResource);
  const bulkUpdate = useBulkUpdateProducts();
  const bulkRemove = useBulkRemoveProducts();
  const duplicate = useDuplicateProduct();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const canEdit = can("products", "edit");
  const canDelete = can("products", "delete");
  // The same "low stock" number the Overview and the shop's "Only N left" use, set in Settings.
  const low = settings?.lowStockAt ?? 2;

  // What the catalogue needs before a product can be added: a category, a colour and a size (the service refuses a product without them too).
  const setup = {
    categories: categories.items.filter((c) => c.active).length,
    colours: colors.items.length,
    sizes: sizes.items.length,
  };
  const ready = setup.categories > 0 && setup.colours > 0 && setup.sizes > 0;
  const loading = products.isLoading || categories.isLoading || colors.isLoading || sizes.isLoading;

  const byId = (id) => products.items.find((p) => p.id === id);
  // A kit can be sent while every piece has a size in stock.
  const kitReady = (k) => k.kitItems.length >= 2 && k.kitItems.every((id) => units(byId(id) ?? { variants: [] }) > 0);

  // The table's columns. A kit has no stock or sales of its own, so those cells say so instead of showing a number.
  const columns = [
    {
      key: "name",
      label: "Product",
      sort: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="block h-14 w-11 flex-none overflow-hidden rounded-[10px] bg-sand-100">{p.photos[0] && <Photo photo={p.photos[0]} label={p.name} className="h-full rounded-none" />}</span>
          <span className="min-w-0">
            <strong className="block font-display">{p.name}</strong>
            <span className="text-xs text-ink-3">{p.type === "kit" ? `Kit of ${p.kitItems.length} pieces` : p.colors.join(", ")}</span>
          </span>
        </div>
      ),
    },
    { key: "category", label: "Category", sort: (p) => p.category },
    { key: "status", label: "Status", render: (p) => <StatusChip status={p.status} /> },
    {
      key: "labels",
      label: "Labels",
      render: (p) => {
        // Labels shown in the row: New, and Best seller (pinned, or by sales).
        const tags = [p.isNew && "New", p.pinnedBestseller ? "Best seller (pinned)" : p.isBestseller && "Best seller"].filter(Boolean);
        return tags.length ? <span className="flex flex-wrap gap-1">{tags.map((t) => <span key={t} className="rounded-r-pill bg-brand-50 px-2 py-0.5 text-[.72rem] font-semibold text-brand-600">{t}</span>)}</span> : <span className="text-ink-4">None</span>;
      },
    },
    { key: "unitsSold", label: "Sold (90 days)", align: "right", sort: (p) => p.unitsSold, render: (p) => (p.type === "kit" ? <span className="text-ink-4">-</span> : p.unitsSold) },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      sort: units,
      render: (p) =>
        p.type === "kit"
          ? kitReady(p) ? <span className="text-ink-3">Follows its pieces</span> : <span className="font-semibold text-warn">A piece is sold out</span>
          : units(p) ? units(p) : <span className="font-semibold text-warn">Sold out</span>,
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      sort: (p) => p.price,
      render: (p) => (p.salePercent ? <span><s className="text-ink-4">{moneyBase(p.price)}</s> {p.salePercent}% off</span> : moneyBase(p.price)),
    },
  ];

  // The filter drawer's sections, in order. Every Shop by group of tags (Movement and so on) gets its own section.
  const filters = [
    { id: "type", label: "Type", options: TYPE, test: (p, v) => p.type === v },
    { id: "status", label: "Status", options: STATUS, test: (p, v) => p.status === v },
    { id: "category", label: "Category", options: categories.items.map((c) => ({ value: c.id, label: c.name })), test: (p, v) => p.categoryId === v },
    ...groups.map((g) => ({
      id: `g-${g.id}`,
      label: g.name,
      options: terms.filter((t) => t.groupId === g.id).map((t) => ({ value: t.id, label: t.name })),
      test: (p, v) => p.termIds.includes(v),
    })),
    {
      id: "label",
      label: "Labels",
      options: LABELS,
      test: (p, v) => (v === "new" ? p.isNew : v === "bestseller" ? p.isBestseller : v === "pinned" ? p.pinnedBestseller : Boolean(p.salePercent)),
    },
    {
      id: "stock",
      label: "Stock",
      options: [{ value: "in", label: "In stock" }, { value: "low", label: `Low (${low} or fewer in a size)` }, { value: "out", label: "Sold out" }],
      test: (p, v) => p.type !== "kit" && (v === "out" ? !units(p) : v === "low" ? p.variants.some((x) => x.stock > 0 && x.stock <= low) : units(p) > 0),
    },
  ];

  // A bulk action updates every ticked row, then clears the selection.
  const bulk = (patch) => (ids, clear) => bulkUpdate.mutateAsync({ ids, patch }).then(clear);
  const LABEL_PATCH = { new: { isNew: true }, "not-new": { isNew: false }, pin: { pinnedBestseller: true }, unpin: { pinnedBestseller: false } };

  return (
    <>
      {/* Page Header: Add product waits until the catalogue is set up */}
      <PageHeader
        lede={`${products.items.filter((p) => p.type !== "kit").length} pieces and ${products.items.filter((p) => p.type === "kit").length} kits. Drafts and archived ones never show in the shop.`}
        action={
          canEdit && (ready ? (
            <Link className="btn btn--primary" to="/admin/products/new"><Plus className="h-4 w-4" aria-hidden="true" /> Add product</Link>
          ) : (
            <button type="button" className="btn btn--primary" disabled title="Set up categories, colours and sizes first"><Plus className="h-4 w-4" aria-hidden="true" /> Add product</button>
          ))
        }
      />
      {/* Setup Checklist: shown until there is a category, a colour and a size */}
      {!loading && !ready && <SetupChecklist counts={setup} />}
      {/* Product Table */}
      <Panel>
        <DataTable
          filterDrawer
          rows={products.items}
          loading={products.isLoading}
          columns={columns}
          search={(p) => [p.name, p.category, ...p.colors, ...p.variants.map((v) => v.sku)].join(" ")}
          searchLabel="Search name, colour or SKU"
          filters={filters}
          onRowClick={(p) => navigate(`/admin/products/${p.id}`)}
          bulkActions={
            canEdit &&
            ((ids, clear) => (
              <>
                <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => bulk({ status: "active" })(ids, clear)}>Publish</button>
                <button type="button" className="btn btn--soft min-h-9 px-3 text-xs" onClick={() => bulk({ status: "archived" })(ids, clear)}>Archive</button>
                <select className="select min-h-9 py-1 text-xs" aria-label="Labels" value="" onChange={(e) => e.target.value && bulk(LABEL_PATCH[e.target.value])(ids, clear)}>
                  <option value="">Labels…</option>
                  <option value="new">Mark as New arrival</option>
                  <option value="not-new">No longer new</option>
                  <option value="pin">Pin to Best sellers</option>
                  <option value="unpin">Unpin from Best sellers</option>
                </select>
                <select className="select min-h-9 py-1 text-xs" aria-label="Set sale" value="" onChange={(e) => e.target.value && bulk({ salePercent: Number(e.target.value) || null })(ids, clear)}>
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
            { label: "View in shop", onClick: () => window.open(p.type === "kit" ? "/shop/kits" : `/product/${p.slug}`, "_blank", "noopener"), hidden: p.status !== "active" },
            { label: "Duplicate", onClick: () => duplicate.mutate(p.id), hidden: !canEdit },
            { label: p.status === "archived" ? "Restore" : "Archive", onClick: () => products.update(p.id, { status: p.status === "archived" ? "draft" : "archived" }), hidden: !canEdit },
            { label: "Delete", danger: true, onClick: () => setDeleting({ ids: [p.id], name: p.name }), hidden: !canDelete },
          ]}
          exportName="products"
          exportRow={(p) => ({
            name: p.name,
            type: p.type,
            category: p.category,
            status: p.status,
            price: p.price,
            salePercent: p.salePercent ?? "",
            stock: p.type === "kit" ? "" : units(p),
            soldLast90Days: p.unitsSold,
            newArrival: p.isNew ? "yes" : "",
            bestSeller: p.isBestseller ? "yes" : "",
            colours: p.colors,
          })}
          empty={ready ? "No products yet. Add the first one." : "Set up the catalogue above, then add the first product."}
        />
      </Panel>
      {/* Delete Confirmation: one product from the row menu, or every ticked one */}
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
