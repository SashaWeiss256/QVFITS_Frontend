/* Admin Offers And Banners */
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { categoriesResource, groupsResource, offersResource, termsResource, productsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import { useSettings } from "@/store/tanstackStore/queries/site";
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
 * Everything the shop is promoting, one small tab for each: the moving
 * promo bar, the deal cards, the sale and the sign-up offer. Each tab shows
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
    { id: "promo", label: "Promo bar", count: draft.promoBar.filter((t) => t.trim()).length },
    { id: "deals", label: "Deal cards", count: liveDeals },
    { id: "sale", label: "Sale" },
    { id: "signup", label: "Sign-up offer" },
  ];
  const [tab, setTab] = useTab(tabs);

  return (
    <>
      {/* Page Header */}
      <PageHeader lede="What the shop is promoting right now. Pick a tab, change the words, then save." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <fieldset disabled={!can("offers", "edit")} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        {tab === "promo" && <PromoBar draft={draft} set={set} />}
        {tab === "deals" && <Deals draft={draft} set={set} />}
        {tab === "sale" && <Sale draft={draft} set={set} />}
        {tab === "signup" && <Sticker draft={draft} set={set} />}
      </fieldset>
      {/* Save Bar: appears once something changes */}
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </>
  );
}

/* Promo Bar: short messages that glide across the top of every page */
function PromoBar({ draft, set }) {
  const { data: settings } = useSettings();
  const { money } = useCurrency();
  const lines = draft.promoBar;
  const last = useRef(0);
  const inputs = useRef([]);

  const fill = (text) => text.replace("{{freeShipping}}", settings ? money(settings.freeShippingOver) : "the free delivery amount").replace("{{phone}}", settings?.phone ?? "the phone number");
  const change = (next) => set("promoBar", next);
  const edit = (i, text) => change(lines.map((l, j) => (j === i ? text : l)));
  const move = (i, by) => {
    const next = [...lines];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x);
    change(next);
  };
  // Adds a name that fills in by itself (the delivery amount or the phone number) to the line being typed in.
  const insert = (token) => {
    const i = Math.min(last.current, Math.max(lines.length - 1, 0));
    if (!lines.length) return change([token]);
    edit(i, `${lines[i]}${lines[i] && !lines[i].endsWith(" ") ? " " : ""}${token}`);
    inputs.current[i]?.focus();
  };
  const shown = lines.map(fill).filter((t) => t.trim());

  return (
    <Panel title="Promo bar" hint="The thin strip at the top of every page. Your messages glide across it from left to right, one after another.">
      {/* Preview: the strip as shoppers see it */}
      <div className="mb-6 overflow-hidden rounded-full bg-[image:var(--brand-grad)] px-5 py-2.5 text-center text-[.78rem] text-cream" aria-label="Preview of the promo bar">
        {shown.length ? shown.join("    ◆    ") : "Add a message to see the bar"}
      </div>

      {/* Messages: one row each */}
      <div className="grid gap-2.5">
        {lines.map((text, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              ref={(el) => { inputs.current[i] = el; }}
              className="input min-w-0 flex-1"
              value={text}
              aria-label={`Message ${i + 1}`}
              placeholder="For example: Free delivery over {{freeShipping}}"
              onFocus={() => { last.current = i; }}
              onChange={(e) => edit(i, e.target.value)}
            />
            <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
            <button type="button" className="icon-btn" aria-label="Move down" disabled={i === lines.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
            <button type="button" className="icon-btn text-warn" aria-label="Remove message" onClick={() => change(lines.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {/* Add and helpers */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn--soft min-h-10 px-5 text-[.85rem]" onClick={() => { change([...lines, ""]); last.current = lines.length; }}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a message
        </button>
        <span className="ml-1 text-[.82rem] text-ink-3">Fill in automatically:</span>
        <button type="button" className="chip chip--raised min-h-9 px-3.5 text-[.8rem]" onClick={() => insert("{{freeShipping}}")}>Free delivery amount</button>
        <button type="button" className="chip chip--raised min-h-9 px-3.5 text-[.8rem]" onClick={() => insert("{{phone}}")}>Phone number</button>
      </div>
    </Panel>
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

/* Sticker: the small corner card that gets shoppers to join the list */
function Sticker({ draft, set }) {
  const sticker = draft.sticker;
  const [more, setMore] = useState(false);
  const patch = (p) => set("sticker", { ...sticker, ...p });

  return (
    <Panel title="Sign-up offer" hint="The small card in the corner of the shop. It invites shoppers to join the list and promises them a code.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <div className="grid gap-3">
          <Toggle checked={sticker.live} onChange={(live) => patch({ live })} label="Show the card" />
          <Field label="Title" value={sticker.title} onChange={(e) => patch({ title: e.target.value })} />
          <Field label="A line about it" value={sticker.text} onChange={(e) => patch({ text: e.target.value })} />
          <Field label="Button words" value={sticker.cta} onChange={(e) => patch({ cta: e.target.value })} />
          <div>
            <button type="button" className="btn btn--ghost min-h-9 px-4 text-xs" aria-expanded={more} onClick={() => setMore((m) => !m)}>{more ? "Hide more options" : "More options"}</button>
            {more && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Small label" value={sticker.tag} onChange={(e) => patch({ tag: e.target.value })} />
                <Field label="Stay hidden for (days) once closed" inputMode="numeric" value={sticker.snoozeDays} onChange={(e) => patch({ snoozeDays: Number(e.target.value) || 0 })} />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className={cn("flex flex-col gap-2 self-start rounded-[22px] bg-ink p-6 text-cream", !sticker.live && "opacity-55")} aria-label="Preview of the card">
          {sticker.tag && <span className="self-start rounded-full bg-white/15 px-3 py-1 text-[.72rem]">{sticker.tag}</span>}
          <b className="font-display text-[1.25rem] leading-tight">{sticker.title || "Title"}</b>
          <p className="m-0 text-[.86rem] opacity-80">{sticker.text || "A line about it"}</p>
          <span className="mt-2 inline-flex min-h-10 items-center justify-center self-start rounded-full bg-[image:var(--brand-grad)] px-5 text-[.82rem] font-semibold text-white">{sticker.cta || "Get my code"}</span>
          {!sticker.live && <span className="text-[.74rem] opacity-80">Switched off, not shown</span>}
        </div>
      </div>
    </Panel>
  );
}
