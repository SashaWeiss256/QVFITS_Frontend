/* Admin Product Editor */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Layers, Shirt } from "lucide-react";

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { categoriesResource, colorsResource, groupsResource, productsResource, sizesResource, termsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import Panel from "@/AdminDashboard/components/Panel";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import TagInput from "@/AdminDashboard/components/TagInput";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import VariantMatrix from "./sections/VariantMatrix";

const BLANK = {
  name: "", slug: "", status: "draft", type: "piece", kitItems: [], isNew: true, pinnedBestseller: false,
  categoryId: "", price: 0, compareAtPrice: null, salePercent: null,
  colorIds: [], termIds: [], blurb: "", details: [], fit: "true", fitNote: "", fabric: "", care: "",
  variants: [], photos: [], seo: { title: "", description: "" },
};
const FITS = [{ value: "true", label: "True to size" }, { value: "small", label: "Runs small" }, { value: "large", label: "Runs large" }, { value: "relaxed", label: "Relaxed cut" }];

const TYPES = [
  { id: "piece", label: "Single piece", hint: "Made in colours and sizes, with its own stock.", icon: Shirt },
  { id: "kit", label: "Kit", hint: "Pieces sold together at a kit price. Stock follows its pieces.", icon: Layers },
];

// The same checks the shop's service makes, shown on the fields before saving.
function problems(p) {
  const out = {};
  const publishing = p.status === "active";
  if (!p.name.trim()) out.name = "Give it a name";
  if (!(p.price > 0)) out.price = "Set a price";
  if (publishing && !p.photos.length) out.photos = "Add at least one photo before publishing";
  if (p.type === "kit") {
    if (p.kitItems.length < 2) out.kitItems = "A kit needs at least two pieces";
    return out;
  }
  if (!p.categoryId) out.categoryId = "Pick a category";
  if (publishing && !p.variants.length) out.variants = "Pick at least one colour and size before publishing";
  else if (publishing && !p.variants.some((v) => v.stock > 0)) out.variants = "Add stock in at least one size before publishing";
  return out;
}

/** Add or edit one product. Everything saves together from the bar at the bottom. */
export default function ProductEdit() {
  const { id } = useParams();
  const products = useCollection(productsResource);
  if (products.isLoading) return <PageLoader />;
  const existing = id ? products.items.find((p) => p.id === id) : null;
  if (id && !existing) return <p className="text-ink-3">That product no longer exists. <Link to="/admin/products" className="link-arrow">All products</Link></p>;
  return <Editor key={id ?? "new"} existing={existing} products={products} />;
}

function Editor({ existing, products }) {
  const navigate = useNavigate();
  const { can } = useAdminAuth();
  const categories = useCollection(categoriesResource);
  const colors = useCollection(colorsResource);
  const sizes = useCollection(sizesResource);
  // Every "Shop by" group of tags gets its own picker: Movement, Fit…
  const tagGroups = useCollection(groupsResource).items.filter((g) => g.kind === "tags");
  const terms = useCollection(termsResource).items;
  const { draft: p, set, dirty, reset, commit } = useDraft(existing ?? BLANK);
  const { moneyBase } = useCurrency();
  const isKit = p.type === "kit";
  const pieces = products.items.filter((x) => x.type !== "kit" && x.id !== existing?.id);
  const separate = p.kitItems.reduce((n, id) => n + (pieces.find((x) => x.id === id)?.price ?? 0), 0);
  const [tried, setTried] = useState(false);
  const errors = tried ? problems(p) : {};
  const readOnly = !can("products", "edit");
  const patch = (obj) => set({ ...p, ...obj });

  const save = async () => {
    setTried(true);
    if (Object.keys(problems(p)).length) return;
    // `sizes` only tracks the picker; the variants are what is saved. A kit has no variants of its own.
    const data = { ...p };
    delete data.sizes;
    if (isKit) Object.assign(data, { variants: [], colorIds: [], termIds: [], categoryId: "" });
    if (existing) commit(await products.update(existing.id, data));
    else {
      const created = await products.create(data);
      reset();
      navigate(`/admin/products/${created.id}`, { replace: true });
    }
  };

  return (
    <>
      {/* The header says New or Edit product; an existing piece also names itself here. */}
      {existing && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="m-0 mr-auto text-[1.4rem] font-bold tracking-tight">{existing.name}</h2>
          {existing.status === "active" && <a className="btn btn--ghost min-h-10 px-4 text-[.85rem]" href={isKit ? "/shop/kits" : `/product/${existing.slug}`} target="_blank" rel="noopener noreferrer">View in shop <ExternalLink className="h-4 w-4" /></a>}
          {existing.status !== "active" && !isKit && <a className="btn btn--ghost min-h-10 px-4 text-[.85rem]" href={`/product/${existing.slug}?preview`}>Preview <ExternalLink className="h-4 w-4" /></a>}
        </div>
      )}

      <fieldset disabled={readOnly} className="m-0 grid min-w-0 gap-6 border-0 p-0 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 gap-6">
          {/* What it is, chosen once: a piece keeps its stock, a kit borrows its pieces'. */}
          {!existing && (
            <Panel title="What are you adding?">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Product type">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={p.type === t.id}
                    onClick={() => patch({ type: t.id, isNew: t.id === "piece" })}
                    className={cn(
                      "flex gap-3 rounded-r-md border p-4 text-left outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-brand-300",
                      p.type === t.id ? "border-brand-300 bg-brand-50" : "border-line hover:bg-cream",
                    )}
                  >
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-r-sm", p.type === t.id ? "bg-[image:var(--brand-grad)] text-white" : "bg-cream-2 text-ink-3")}>
                      <t.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <strong className="block text-sm">{t.label}</strong>
                      <span className="text-[.82rem] text-ink-3">{t.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Details">
            <div className="grid gap-4">
              <Field label="Name" value={p.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} />
              <Field label="Short description" as="textarea" rows={3} value={p.blurb} onChange={(e) => patch({ blurb: e.target.value })} hint={isKit ? "The line under the kit's name, e.g. what it's built for." : "The paragraph under the name on the product page."} />
              {!isKit && <>
              <Field label="Details">{(fid) => <TagInput id={fid} value={p.details} onChange={(details) => patch({ details })} placeholder="e.g. Squat-tested opaque, then Enter" allowCommas />}</Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fabric" value={p.fabric} onChange={(e) => patch({ fabric: e.target.value })} />
                <Field label="Fit" options={FITS} value={p.fit ?? "true"} onChange={(e) => patch({ fit: e.target.value })} />
              </div>
              <Field label="Fit note" value={p.fitNote} onChange={(e) => patch({ fitNote: e.target.value })} hint="Shown on the product and used by Vee, e.g. Runs small. Size up if between." />
              <Field label="Care" as="textarea" rows={2} value={p.care} onChange={(e) => patch({ care: e.target.value })} />
              </>}
            </div>
          </Panel>

          <Panel title="Photos">
            <ImageUploader value={p.photos} onChange={(photos) => patch({ photos })} colors={colors.items.filter((c) => p.colorIds.includes(c.id))} label={isKit ? "The kit's own photo, all the pieces worn together." : "The first is the card photo; the second shows on hover and in the gallery."} />
            {errors.photos && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{errors.photos}</p>}
          </Panel>

          {isKit ? (
            <Panel title="Pieces in this kit" hint="Two or more single pieces. A shopper adds them all at once, and checkout charges the kit price while the whole set is in the bag.">
              <ProductPicker products={pieces} value={p.kitItems} onChange={(kitItems) => patch({ kitItems })} max={6} />
              {errors.kitItems && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{errors.kitItems}</p>}
              {p.kitItems.length > 0 && (
                <p className="m-0 mt-3 text-sm text-ink-3">Bought one by one: <strong className="text-ink">{moneyBase(separate)}</strong>{p.price > 0 && separate > p.price && <> · the kit saves shoppers <strong className="text-brand-600">{moneyBase(separate - p.price)}</strong></>}</p>
              )}
            </Panel>
          ) : (
            <Panel title="Colours, sizes and stock" hint="A change here is logged as a count correction. Log restocks and showroom sales under Products, Stock.">
              <VariantMatrix product={p} colors={colors.items} sizes={sizes.items} onChange={patch} />
              {errors.variants && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{errors.variants}</p>}
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Status">
            <Field label="Visibility" options={[{ value: "draft", label: "Draft, hidden from the shop" }, { value: "active", label: "Active, on sale" }, { value: "archived", label: "Archived" }]} value={p.status} onChange={(e) => patch({ status: e.target.value })} />
          </Panel>

          <Panel title="Pricing">
            <div className="grid gap-4">
              <Field label={isKit ? "Kit price (UGX)" : "Price (UGX)"} inputMode="numeric" value={p.price || ""} placeholder={isKit && separate ? String(separate) : undefined} onChange={(e) => patch({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })} error={errors.price} hint={isKit ? "What the whole kit costs. Lower than the pieces bought one by one to give a saving." : undefined} />
              {!isKit && <Field label="Sale (% off)" inputMode="numeric" value={p.salePercent ?? ""} onChange={(e) => patch({ salePercent: Math.min(90, Number(e.target.value.replace(/\D/g, ""))) || null })} hint="Shows only while the sale is on (Offers and banners)." />}
            </div>
          </Panel>

          {!isKit && (
            <Panel title="Labels" hint="Where the piece shows besides the shop.">
              <div className="grid gap-4">
                <Toggle checked={p.isNew} onChange={(isNew) => patch({ isNew })} label="New arrival" hint="Shows on New in and the home New releases rail. Turn off once it's no longer new." />
                <Toggle checked={p.pinnedBestseller} onChange={(pinnedBestseller) => patch({ pinnedBestseller })} label="Pin to Best sellers" hint="Always on Best sellers, on top of the pieces that sell the most." />
                {existing && (
                  <p className="m-0 rounded-r-md bg-cream px-3 py-2 text-[.8rem] text-ink-3">
                    {existing.unitsSold} sold in the last 90 days{existing.isBestseller && !existing.pinnedBestseller ? ", so it's a best seller by sales." : "."}
                  </p>
                )}
              </div>
            </Panel>
          )}

          {!isKit && <Panel title="Organisation">
            <div className="grid gap-4">
              <Field label="Category" options={[{ value: "", label: "Pick one" }, ...categories.items.map((c) => ({ value: c.id, label: c.name }))]} value={p.categoryId} onChange={(e) => patch({ categoryId: e.target.value })} error={errors.categoryId} />
              {tagGroups.map((g) => (
                <fieldset key={g.id} className="m-0 border-0 p-0">
                  <legend className="mb-2 text-sm font-semibold text-ink-2">{g.name}</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {terms.filter((t) => t.groupId === g.id).map((t) => {
                      const on = p.termIds.includes(t.id);
                      return <button key={t.id} type="button" aria-pressed={on} className={cn("chip", on && "is-on")} onClick={() => patch({ termIds: on ? p.termIds.filter((x) => x !== t.id) : [...p.termIds, t.id] })}>{t.name}</button>;
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </Panel>}

          <Panel title="Search engines">
            <div className="grid gap-4">
              <Field label="Web address" value={p.slug} onChange={(e) => patch({ slug: e.target.value })} hint={`/product/${p.slug || "made-from-the-name"}`} />
              <Field label="Page title" value={p.seo.title} placeholder={p.name} onChange={(e) => patch({ seo: { ...p.seo, title: e.target.value } })} />
              <Field label="Description" as="textarea" rows={3} value={p.seo.description} placeholder={p.blurb} onChange={(e) => patch({ seo: { ...p.seo, description: e.target.value } })} />
            </div>
          </Panel>
        </div>
      </fieldset>

      <SaveBar dirty={dirty || !existing} saving={products.isSaving} onSave={save} onReset={existing ? reset : () => navigate("/admin/products")} label={existing ? "Save product" : "Add product"} disabled={readOnly} />
    </>
  );
}
