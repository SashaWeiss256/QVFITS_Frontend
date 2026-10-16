/* Admin Pages And Menus */
import { useState } from "react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { pagesResource, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Tabs from "@/AdminDashboard/components/Tabs";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import CopyEditor from "./sections/CopyEditor";
import MenuEditor from "./sections/MenuEditor";

// One tab per page of copy, in the order shoppers meet them.
const PAGES = [
  ["shop", "Shop"], ["product", "Product page"], ["about", "About"], ["sizeGuide", "Size guide"], ["contact", "Contact"],
  ["checkout", "Checkout"], ["trackOrder", "Track order"], ["notFound", "Page not found"], ["assistant", "Vee"], ["footer", "Footer"],
];

/**
 * The words on every page that is not a product, and every menu. The home
 * page has its own screen; policies follow Settings so fees always match.
 */
export default function AdminPages() {
  const [tab, setTab] = useState("menus");
  const { can } = useAdminAuth();
  const doc = useDocument(pagesResource);

  return (
    <>
      <PageHeader title="Pages and menus" lede="Headings, text and buttons across the shop, and the links in every menu." />
      <Tabs tabs={[{ id: "menus", label: "Menus" }, ...PAGES.map(([id, label]) => ({ id, label }))]} value={tab} onChange={setTab} />
      {tab === "menus" ? <MenuEditor canEdit={can("pages", "edit")} /> : doc.data ? <PageCopy key={tab} doc={doc} page={tab} canEdit={can("pages", "edit")} /> : <PageLoader />}
    </>
  );
}

function PageCopy({ doc, page, canEdit }) {
  const { draft, set, dirty, reset, commit } = useDraft(doc.data[page]);
  return (
    <>
      <Panel>
        <fieldset disabled={!canEdit} className="m-0 grid gap-4 border-0 p-0">
          {Object.entries(draft).map(([k, v]) => (
            <CopyEditor key={k} label={k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())} value={v} onChange={(nv) => set(k, nv)} />
          ))}
        </fieldset>
      </Panel>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit((await doc.save({ [page]: draft }))[page])} />
    </>
  );
}
