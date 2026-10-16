/* Admin Offers And Banners */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { offersResource, useDocument } from "@/store/tanstackStore/queries/admin";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { MARKETING_TABS } from "@/AdminDashboard/lib/constants";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

const TONES = [{ value: "brand", label: "Brand gradient" }, { value: "dark", label: "Dark" }, { value: "teal", label: "Teal" }];

/**
 * Everything the shop is promoting right now. Every offer shows next to the
 * real WhatsApp number, so switch one off the day it ends: a stale "20% off"
 * is a promise the shop has to keep.
 */
export default function AdminOffers() {
  const doc = useDocument(offersResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const sale = draft.sale;
  const sticker = draft.sticker;

  return (
    <>
      <PageHeader title="Offers and banners" lede="The promo bar, the sale, the deal cards on the shop page, and the sign-up sticker." />
      <AdminNavTabs tabs={MARKETING_TABS} />
      <fieldset disabled={!can("offers", "edit")} className="m-0 grid gap-6 border-0 p-0">
        <Panel title="Sale">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <Toggle checked={sale.live} onChange={(live) => set("sale", { ...sale, live })} label="Sale is on" hint="Pieces with a sale % show reduced prices and fill the /shop?sale=1 rail." />
            <Field label="Headline (up to % off)" inputMode="numeric" value={sale.percentUpTo} onChange={(e) => set("sale", { ...sale, percentUpTo: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
          </div>
          <p className="mt-3 mb-0 text-xs text-ink-3">Set each piece's own % on the product, or tick several in Products and use "Sale…".</p>
        </Panel>

        <Panel title="Promo bar">
          <p className="mt-0 text-sm text-ink-3">The strip above the header. {"{freeShipping}"} and {"{phone}"} fill in from Settings.</p>
          <ListEditor
            items={draft.promoBar.map((text, i) => ({ id: i, text }))}
            onChange={(items) => set("promoBar", items.map((x) => x.text))}
            newItem={() => ({ id: Date.now(), text: "" })}
            addLabel="Add a line"
            itemLabel={(_, i) => `Line ${i + 1}`}
            render={(item, update) => <Field label="Text" value={item.text} onChange={(e) => update({ text: e.target.value })} />}
          />
        </Panel>

        <Panel title="Deal cards">
          <ListEditor
            items={draft.deals}
            onChange={(deals) => set("deals", deals)}
            newItem={() => ({ id: `deal-${Date.now().toString(36)}`, live: false, tag: "", title: "", text: "", cta: "Shop now", href: "/shop", tone: "brand" })}
            addLabel="Add a deal"
            itemLabel={(d) => d.title || "New deal"}
            render={(d, update) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle className="sm:col-span-2" checked={d.live} onChange={(live) => update({ live })} label="Live" />
                <Field label="Tag" value={d.tag} onChange={(e) => update({ tag: e.target.value })} placeholder="Limited" />
                <Field label="Title" value={d.title} onChange={(e) => update({ title: e.target.value })} />
                <Field label="Text" className="sm:col-span-2" value={d.text} onChange={(e) => update({ text: e.target.value })} />
                <Field label="Button" value={d.cta} onChange={(e) => update({ cta: e.target.value })} />
                <Field label="Goes to" value={d.href ?? ""} onChange={(e) => update({ href: e.target.value || null })} hint="Empty opens WhatsApp." />
                <Field label="Look" options={TONES} value={d.tone} onChange={(e) => update({ tone: e.target.value })} />
              </div>
            )}
          />
        </Panel>

        <Panel title="Sign-up sticker">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle className="sm:col-span-2" checked={sticker.live} onChange={(live) => set("sticker", { ...sticker, live })} label="Show the sticker" hint="The small card bottom-left. It promises the code to anyone who signs up." />
            <Field label="Tag" value={sticker.tag} onChange={(e) => set("sticker", { ...sticker, tag: e.target.value })} />
            <Field label="Title" value={sticker.title} onChange={(e) => set("sticker", { ...sticker, title: e.target.value })} />
            <Field label="Text" className="sm:col-span-2" value={sticker.text} onChange={(e) => set("sticker", { ...sticker, text: e.target.value })} />
            <Field label="Button" value={sticker.cta} onChange={(e) => set("sticker", { ...sticker, cta: e.target.value })} />
            <Field label="Hidden for (days) once closed" inputMode="numeric" value={sticker.snoozeDays} onChange={(e) => set("sticker", { ...sticker, snoozeDays: Number(e.target.value) || 0 })} />
          </div>
        </Panel>
      </fieldset>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </>
  );
}
