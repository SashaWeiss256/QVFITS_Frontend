/* Admin Orders */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import OrderList from "./sections/OrderList";
import Payments from "./sections/Payments";
import Returns from "./sections/Returns";

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "returns", label: "Returns and refunds" },
  { id: "payments", label: "Payments" },
];

/**
 * Everything after the bag: orders from checkout and sales recorded in the
 * showroom, returns and their refunds or exchanges, and every payment in
 * and refund out, each tied to its order.
 */
export default function AdminOrders() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "orders" && <OrderList />}
      {tab === "returns" && <Returns />}
      {tab === "payments" && <Payments />}
    </>
  );
}
