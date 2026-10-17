/* Colours */
import { colorsResource, productsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import AttributeList from "@/AdminDashboard/components/AttributeList";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

// The colours products come in, each with the swatch the shop shows.
export default function Colours() {
  const products = useCollection(productsResource);
  const used = (c) => {
    const n = products.items.filter((p) => p.colorIds.includes(c.id)).length;
    return n ? `${n} ${n === 1 ? "product" : "products"}` : "Not used yet";
  };

  return (
    <>
      <PageHeader lede="The colours products come in, in the order the colour filter lists them." />
      <Panel>
        <AttributeList resource={colorsResource} module="categories" noun="colour" blank={{ name: "", hex: "#000000" }} name={(c) => c.name} swatch={(c) => c.hex} usage={used}
          fields={[{ key: "name", label: "Name", required: true }, { key: "hex", label: "Swatch", type: "color", required: true }]} />
      </Panel>
    </>
  );
}
