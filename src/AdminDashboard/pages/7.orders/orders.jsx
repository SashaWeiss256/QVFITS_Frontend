/* Admin Orders */
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOrders } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import AdminTable from "../../../components/AdminTable";
import PageHeader from "../../../components/PageHeader";
import Panel from "../../../components/Panel";

// The order drawer and status changes (useUpdateOrderStatus) port next.
export default function SalesOrders() {
  const { data: orders = [] } = useOrders();
  const { moneyBase } = useCurrency();

  const columns = [
    { key: "ref", label: "Order", render: (o) => <strong className="font-display">{o.ref}</strong> },
    { key: "createdAt", label: "Date", render: (o) => formatDate(o.createdAt) },
    { key: "name", label: "Customer" },
    { key: "status", label: "Status", render: (o) => <StatusChip status={o.status} /> },
    { key: "total", label: "Total", align: "right", render: (o) => moneyBase(o.total) },
  ];

  return (
    <>
      <PageHeader title="Orders" lede="Every order, guest or signed in." />
      <Panel>
        <AdminTable columns={columns} rows={orders} empty="No orders yet." />
      </Panel>
    </>
  );
}
