/* Admin Customers */
import { useCustomers } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import AdminTable from "../../../components/AdminTable";
import PageHeader from "../../../components/PageHeader";
import Panel from "../../../components/Panel";

export default function SalesCustomers() {
  const { data: customers = [] } = useCustomers();

  const columns = [
    { key: "name", label: "Name", render: (c) => <strong className="font-display">{c.name}</strong> },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (c) => c.phone || "—" },
    { key: "createdAt", label: "Joined", render: (c) => formatDate(c.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Customers" lede="Shoppers with an account. Guests appear on their orders." />
      <Panel>
        <AdminTable columns={columns} rows={customers} empty="No accounts yet." />
      </Panel>
    </>
  );
}
