/* Admin Discount Codes */
import { discountsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import AdminTable from "../../../components/AdminTable";
import PageHeader from "../../../components/PageHeader";
import Panel from "../../../components/Panel";

// The add / edit dialog ports into sections/ next.
export default function SalesDiscounts() {
  const discounts = useCollection(discountsResource);

  const columns = [
    { key: "code", label: "Code", render: (d) => <strong className="font-display">{d.code}</strong> },
    { key: "percent", label: "Off", render: (d) => `${d.percent}%` },
    { key: "active", label: "Status", render: (d) => (d.active ? "Active" : "Off") },
  ];

  return (
    <>
      <PageHeader title="Discount codes" lede="Codes shoppers enter at checkout." />
      <Panel>
        <AdminTable columns={columns} rows={discounts.items} empty="No codes yet." />
      </Panel>
    </>
  );
}
