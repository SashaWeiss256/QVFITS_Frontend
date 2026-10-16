/* Admin Rails And Kits */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { contentResource, looksResource, productsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Tabs from "@/AdminDashboard/components/Tabs";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

/**
 * Hand-picked groupings: the two home page rails (four pieces each, topped
 * up from the New or Bestseller label if short) and the kits on the shop
 * page that pair pieces into a full outfit.
 */
export default function AdminCollections() {
  const [tab, setTab] = useState("rails");
  return (
    <>
      <PageHeader title="Rails and kits" lede="What the home page rails show, and the full kits on the shop page." />
      <Tabs tabs={[{ id: "rails", label: "Home rails" }, { id: "kits", label: "Kits" }]} value={tab} onChange={setTab} />
      {tab === "rails" ? <Rails /> : <Kits />}
    </>
  );
}

function Rails() {
  const doc = useDocument(contentResource);
  const products = useCollection(productsResource);
  if (!doc.data) return <PageLoader />;
  return <RailsEditor doc={doc} products={products.items} />;
}

function RailsEditor({ doc, products }) {
  const { draft, set, dirty, reset, commit } = useDraft(doc.data.rails);
  const rail = (key, label) => {
    const r = draft[key];
    const patch = (p) => set({ ...draft, [key]: { ...r, ...p } });
    return (
      <Panel title={label}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Small heading" value={r.kicker} onChange={(e) => patch({ kicker: e.target.value })} />
          <Field label="Title" value={r.title} onChange={(e) => patch({ title: e.target.value })} />
          <Field label="Button" value={r.cta} onChange={(e) => patch({ cta: e.target.value })} />
          <Field label="Button goes to" value={r.href} onChange={(e) => patch({ href: e.target.value })} hint="e.g. /shop?badge=New" />
        </div>
        <p className="mt-5 mb-2 text-sm font-semibold text-ink-2">Pieces, in order</p>
        <ProductPicker products={products} value={r.productIds} onChange={(productIds) => patch({ productIds })} max={4} />
      </Panel>
    );
  };

  return (
    <div className="grid gap-6">
      {rail("newReleases", "New releases")}
      {rail("bestSellers", "Best sellers")}
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit((await doc.save({ rails: draft })).rails)} />
    </div>
  );
}

const BLANK_KIT = { title: "", note: "", items: [], live: true };

function Kits() {
  const looks = useCollection(looksResource);
  const products = useCollection(productsResource);
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const save = async () => {
    if (editing.id) await looks.update(editing.id, editing);
    else await looks.create(editing);
    setEditing(null);
  };

  return (
    <Panel>
      <div className="mb-4 flex justify-end">
        {can("collections", "edit") && <Button onClick={() => setEditing(BLANK_KIT)}><Plus className="h-4 w-4" aria-hidden="true" /> Add kit</Button>}
      </div>
      <ul className="m-0 grid list-none gap-0 p-0">
        {looks.items.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="min-w-0 flex-1">
              <strong className="font-display">{l.title}</strong>
              <p className="m-0 text-sm text-ink-3">{l.items.length} pieces · {l.live ? "Live" : "Hidden"}</p>
            </div>
            <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => setEditing(l)}>Edit</button>
            {can("collections", "delete") && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => setRemoving(l)}>Delete</button>}
          </li>
        ))}
      </ul>
      <Drawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? editing.title : "New kit"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={looks.isSaving} disabled={!editing?.title.trim() || editing.items.length < 2}>Save kit</Button></>}
      >
        {editing && (
          <div className="grid gap-4">
            <Field label="Name" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Lift Day" />
            <Field label="Note" as="textarea" rows={2} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
            <Toggle checked={editing.live} onChange={(live) => setEditing({ ...editing, live })} label="Show on the shop page" />
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-2">Pieces (two or more)</p>
              <ProductPicker products={products.items} value={editing.items} onChange={(items) => setEditing({ ...editing, items })} />
            </div>
          </div>
        )}
      </Drawer>
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.title} loading={looks.isRemoving} onConfirm={() => looks.remove(removing.id).then(() => setRemoving(null))} />
    </Panel>
  );
}
