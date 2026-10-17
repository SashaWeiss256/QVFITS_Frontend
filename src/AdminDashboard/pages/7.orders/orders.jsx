/* Admin Orders */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import OrderList from "./sections/OrderList";
import Returns from "./sections/Returns";

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "returns", label: "Returns and refunds" },
];

/**
 * Everything after the bag: orders from checkout and sales recorded in the
 * showroom, and returns with their refunds or exchanges. Every payment in
 * and refund out has its own page, Transactions.
 */
export default function AdminOrders() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "orders" && <OrderList />}
      {tab === "returns" && <Returns />}
    </>
  );
}
