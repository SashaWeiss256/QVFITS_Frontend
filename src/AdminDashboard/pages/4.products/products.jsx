/* Admin Products */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import ProductList from "./sections/ProductList";
import Reviews from "./sections/Reviews";
import Stock from "./sections/Stock";

const TABS = [
  { id: "products", label: "Products" },
  { id: "stock", label: "Stock" },
  { id: "reviews", label: "Reviews" },
];

/**
 * Everything about a piece in one place: the list (add, edit, delete, kits),
 * stock per colour and size with every change logged, and the reviews.
 */
export default function AdminProducts() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "products" && <ProductList />}
      {tab === "stock" && <Stock />}
      {tab === "reviews" && <Reviews />}
    </>
  );
}
