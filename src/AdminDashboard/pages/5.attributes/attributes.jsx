/* Admin Colours, Sizes And Filters */
import { useState } from "react";

import { activitiesResource, colorsResource, productsResource, sizesResource, useCollection } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Tabs from "@/AdminDashboard/components/Tabs";
import AttributeList from "./sections/AttributeList";
import ShopFilters from "./sections/ShopFilters";

const SIZE_GROUPS = [{ value: "apparel", label: "Clothing" }, { value: "shoe", label: "Shoes" }];

/**
 * What products are described with: colours and their swatches, sizes,
 * activities, and the layout of the shop's filter sidebar. A change here
 * shows on the storefront the moment it is saved.
 */
export default function AdminAttributes() {
  const [tab, setTab] = useState("colors");
  const products = useCollection(productsResource);
  const used = (test) => {
    const n = products.items.filter(test).length;
    return n ? `${n} products` : "Not used yet";
  };

  return (
    <>
      <PageHeader title="Colours, sizes and filters" lede="The building blocks of every product and the shop filters." />
      <Tabs
        tabs={[{ id: "colors", label: "Colours" }, { id: "sizes", label: "Sizes" }, { id: "activities", label: "Activities" }, { id: "filters", label: "Shop filters" }]}
        value={tab}
        onChange={setTab}
      />
      <Panel>
        {tab === "colors" && (
          <AttributeList resource={colorsResource} noun="colour" blank={{ name: "", hex: "#000000" }} name={(c) => c.name} swatch={(c) => c.hex}
            usage={(c) => used((p) => p.colorIds.includes(c.id))}
            fields={[{ key: "name", label: "Name", required: true }, { key: "hex", label: "Swatch", type: "color", required: true }]} />
        )}
        {tab === "sizes" && (
          <AttributeList resource={sizesResource} noun="size" blank={{ label: "", group: "apparel" }} name={(s) => s.label}
            usage={(s) => used((p) => p.variants.some((v) => v.size === s.label))}
            fields={[{ key: "label", label: "Size", required: true, hint: "As shoppers see it: XS, M, 38…" }, { key: "group", label: "Kind", options: SIZE_GROUPS }]} />
        )}
        {tab === "activities" && (
          <AttributeList resource={activitiesResource} noun="activity" blank={{ label: "" }} name={(a) => a.label}
            usage={(a) => used((p) => p.activityIds.includes(a.id))}
            fields={[{ key: "label", label: "Activity", required: true, hint: "Used by the shop filter and Shop by movement." }]} />
        )}
        {tab === "filters" && <ShopFilters />}
      </Panel>
    </>
  );
}
