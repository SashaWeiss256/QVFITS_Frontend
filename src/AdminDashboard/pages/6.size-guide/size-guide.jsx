/* Admin Sizes And Size Guide */
import { Navigate, useSearchParams } from "react-router-dom";

import { productsResource, sizesResource, useCollection } from "@/store/tanstackStore/queries/admin";
import AttributeList from "@/AdminDashboard/components/AttributeList";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import SizeChart from "./sections/SizeChart";

const TABS = [
  { id: "chart", label: "Size chart" },
  { id: "sizes", label: "Sizes" },
];
const LEDES = {
  chart: "Body measurements in cm, from and to, per size. Shoppers can switch to inches.",
  sizes: "The sizes a product can come in, in the order the shop lists them.",
};
const SIZE_GROUPS = [{ value: "apparel", label: "Clothing" }, { value: "shoe", label: "Shoes" }];

/**
 * Everything about fit, as on belioras' Sizes and guides: the size chart
 * the size guide, the finder and Vee read; and the sizes products are made
 * in. The shop's filters moved to Categories, beside the groups they show.
 */
export default function AdminSizeGuide() {
  const [params] = useSearchParams();
  const [tab, setTab] = useTab(TABS);
  const products = useCollection(productsResource);
  const used = (s) => {
    const n = products.items.filter((p) => p.variants.some((v) => v.size === s.label)).length;
    return n ? `${n} ${n === 1 ? "product" : "products"}` : "Not used yet";
  };

  // The old Shop filters tab lives on Categories now.
  if (params.get("tab") === "filters") return <Navigate to="/admin/categories?tab=filters" replace />;

  return (
    <>
      <PageHeader lede={LEDES[tab]} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "chart" && <SizeChart />}
      {tab === "sizes" && (
        <Panel>
          <AttributeList resource={sizesResource} module="size-guide" noun="size" blank={{ label: "", group: "apparel" }} name={(s) => s.label} caption={(s) => SIZE_GROUPS.find((g) => g.value === s.group)?.label ?? ""} usage={used}
            fields={[{ key: "label", label: "Size", required: true, hint: "As shoppers see it: XS, M, 38…" }, { key: "group", label: "Kind", options: SIZE_GROUPS }]} />
        </Panel>
      )}
    </>
  );
}
