/* Admin Products */
import { useCurrency } from "@/store/context/CurrencyContext";
import { productsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { anyInStock } from "@/utils/stockLevel";
import AdminTable from "../../../components/AdminTable";
import PageHeader from "../../../components/PageHeader";
import Panel from "../../../components/Panel";

// The product form (details, variants, stock per size, photos through
// lib/media.js) ports into sections/ next.
export default function CatalogProducts() {
  const products = useCollection(productsResource);
  const { moneyBase } = useCurrency();

  const columns = [
    { key: "name", label: "Product", render: (p) => <strong className="font-display">{p.name}</strong> },
    { key: "category", label: "Category" },
    { key: "badge", label: "Label", render: (p) => p.badge ?? "—" },
    { key: "stock", label: "Stock", render: (p) => (anyInStock(p) ? Object.values(p.stock).reduce((a, b) => a + b, 0) : "Sold out") },
    { key: "price", label: "Price", align: "right", render: (p) => moneyBase(p.price) },
  ];

  return (
    <>
      <PageHeader title="Products" lede={`${products.items.length} pieces in the catalogue. Prices are placeholders until the shop confirms them.`} />
      <Panel>
        <AdminTable columns={columns} rows={products.items} />
      </Panel>
    </>
  );
}
