/* Admin Offers */

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { categoriesResource, groupsResource, offersResource, termsResource, productsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import { LABELS, targetLabel } from "@/utils/shopTargets";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Tabs from "@/AdminDashboard/components/Tabs";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import { useTab } from "@/AdminDashboard/lib/useTab";

// The deal cards' three looks, shown as small swatches.
const TONES = [
  { value: "brand", label: "Soft", swatch: "bg-sand-100 ring-1 ring-line-2" },
  { value: "dark", label: "Dark", swatch: "bg-ink" },
  { value: "teal", label: "Teal", swatch: "bg-teal-500" },
];

// The same colours the shop gives each look, so the preview is what shoppers see.
const PREVIEW = {
  brand: "border border-line bg-sand-100 text-ink",
  dark: "bg-ink text-cream",
  teal: "bg-teal-500 text-cream",
};

/**
 * Everything the shop is promoting, one small tab for each: the
 * deal cards, the sale and the sign-up offer. Each tab shows
 * what shoppers will see. Switch an offer off the day it ends: a stale
 * "20% off" is a promise the shop has to keep.
 */
export default function AdminOffers() {
  const doc = useDocument(offersResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const liveDeals = draft.deals.filter((d) => d.live).length;
  const tabs = [
    { id: "deals", label: "Deal cards", count: liveDeals },
    { id: "sale", label: "Sale" },
  ];
  const [tab, setTab] = useTab(tabs);

  return (
    <>
      {/* Page Header */}
      <PageHeader lede="What the shop is promoting right now. Pick a tab, change the words, then save." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <fieldset disabled={!can("offers", "edit")} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        {tab === "deals" && <Deals draft={draft} set={set} />}
        {tab === "sale" && <Sale draft={draft} set={set} />}
      </fieldset>
      {/* Save Bar: appears once something changes */}
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </>
  );
}

/* Where a deal card goes: one short list, no nested pickers */
function Destination({ deal, update }) {
  const categories = useCollection(categoriesResource).items;
  const lookup = {
    categories,
    groups: useCollection(groupsResource).items,
    terms: useCollection(termsResource).items,
    products: useCollection(productsResource).items,
  };
  const t = deal.target;
  // A link made earlier with the full picker (a movement, one piece, a page) is kept as it is until another choice is made.
  const kept = t && (t.terms?.length || t.product || t.page || (t.categories?.length && t.label) || t.categories?.length > 1);
  const value = deal.href === null && !t ? "whatsapp"
    : kept ? "keep"
    : t?.categories?.length ? `cat:${t.categories[0]}`
    : t?.label ? `label:${t.label}`
    : "shop";
  const options = [
    ...(kept ? [{ value: "keep", label: `Current link: ${targetLabel(t, lookup)}` }] : []),
    { value: "shop", label: "The whole shop" },
    ...Object.entries(LABELS).map(([k, l]) => ({ value: `label:${k}`, label: l.name })),
    ...categories.map((c) => ({ value: `cat:${c.id}`, label: c.name })),
    { value: "whatsapp", label: "Opens a WhatsApp chat" },
  ];
  const pick = (v) => {
    if (v === "keep") return;
    if (v === "whatsapp") update({ target: undefined, href: null });
    else if (v === "shop") update({ target: {}, href: undefined });
    else if (v.startsWith("label:")) update({ target: { label: v.slice(6) }, href: undefined });
    else update({ target: { categories: [v.slice(4)] }, href: undefined });
  };
  return <Field className="sm:col-span-2" label="Where it goes" options={options} value={value} onChange={(e) => pick(e.target.value)} />;
}

/* Deals: the cards on the shop page, each with a live preview */
function Deals({ draft, set }) {
  return (
    <Panel title="Deal cards" hint="The cards at the top of the shop page. Only the ones switched on are shown.">
      <ListEditor
        items={draft.deals}
        onChange={(deals) => set("deals", deals)}
        newItem={() => ({ id: `deal-${Date.now().toString(36)}`, live: false, tag: "", title: "", text: "", cta: "Shop now", target: {}, tone: "brand" })}
        addLabel="Add a deal card"
        itemLabel={(d) => d.title || "New deal"}
        render={(d, update) => (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2" value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="Summer drop" />
              <Field label="A line about it" className="sm:col-span-2" value={d.text} onChange={(e) => update({ text: e.target.value })} />
              <Field label="Button words" value={d.cta} onChange={(e) => update({ cta: e.target.value })} />
              <div className="flex flex-col gap-1.5">
                <span className="text-[.82rem] font-medium text-ink-3">Colour</span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Card colour">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={d.tone === t.value}
                      onClick={() => update({ tone: t.value })}
                      className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border bg-white px-3.5 text-[.82rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300", d.tone === t.value ? "border-ink text-ink" : "border-line-2 text-ink-3 hover:border-ink-3")}
                    >
                      <i className={cn("block h-4 w-4 rounded-full", t.swatch)} aria-hidden="true" /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <Destination deal={d} update={update} />
              <Toggle className="sm:col-span-2" checked={d.live} onChange={(live) => update({ live })} label="Show on the shop page" hint="Switch it off when the offer ends." />
            </div>

            {/* Preview: the card as shoppers see it */}
            <div className={cn("flex min-h-52 flex-col gap-2 self-start rounded-[22px] p-6", PREVIEW[d.tone] ?? PREVIEW.brand, !d.live && "opacity-55")} aria-label="Preview of this card">
              {d.tag && <span className="self-start rounded-full bg-black/10 px-3 py-1 text-[.72rem]">{d.tag}</span>}
              <b className="mt-1 font-display text-[1.5rem] leading-[1.05]">{d.title || "Title"}</b>
              <p className="m-0 flex-1 text-[.88rem] opacity-80">{d.text || "A line about it"}</p>
              <span className="mt-2 self-start border-b border-current pb-0.5 text-[.82rem]">{d.cta || "Shop now"}</span>
              {!d.live && <span className="text-[.74rem] opacity-80">Switched off, not shown</span>}
            </div>
          </div>
        )}
      />
    </Panel>
  );
}

/* Sale: one switch for every piece that has a sale price */
function Sale({ draft, set }) {
  const sale = draft.sale;
  return (
    <Panel title="Sale" hint="Turn this on and every piece with a sale price shows the reduced price, and the Sale page fills up.">
      <div className="grid max-w-xl gap-5">
        <Toggle checked={sale.live} onChange={(live) => set("sale", { ...sale, live })} label="Sale is on" hint="Switch it off the day the sale ends." />
        <Field label="Show on the shop: up to this much off (%)" inputMode="numeric" value={sale.percentUpTo} onChange={(e) => set("sale", { ...sale, percentUpTo: Number(e.target.value.replace(/\D/g, "")) || 0 })} hint="Set each piece's own sale price on its Products page." />
      </div>
    </Panel>
  );
}
