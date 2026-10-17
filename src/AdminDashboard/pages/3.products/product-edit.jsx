/* Admin Product Editor */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { categoriesResource, colorsResource, movementsResource, productsResource, sizesResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import TagInput from "@/AdminDashboard/components/TagInput";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import VariantMatrix from "./sections/VariantMatrix";

const BLANK = {
  name: "", slug: "", status: "draft", categoryId: "", price: 0, compareAtPrice: null, salePercent: null, badge: null,
  colorIds: [], movementIds: [], blurb: "", details: [], fit: "true", fitNote: "", fabric: "", care: "",
  variants: [], photos: [], seo: { title: "", description: "" },
};
const FITS = [{ value: "true", label: "True to size" }, { value: "small", label: "Runs small" }, { value: "large", label: "Runs large" }, { value: "relaxed", label: "Relaxed cut" }];

function problems(p) {
  const out = {};
  if (!p.name.trim()) out.name = "Give it a name";
  if (!p.categoryId) out.categoryId = "Pick a category";
  if (!(p.price > 0)) out.price = "Set a price";
  if (p.status === "active" && !p.variants.length) out.variants = "Pick at least one colour and size before publishing";
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
  const movements = useCollection(movementsResource);
  const { draft: p, set, dirty, reset, commit } = useDraft(existing ?? BLANK);
  const [tried, setTried] = useState(false);
  const errors = tried ? problems(p) : {};
  const readOnly = !can("products", "edit");
  const patch = (obj) => set({ ...p, ...obj });

  const save = async () => {
    setTried(true);
    if (Object.keys(problems(p)).length) return;
    // `sizes` only tracks the picker; the variants are what is saved.
    const data = { ...p };
    delete data.sizes;
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
          {existing.status === "active" && <a className="btn btn--ghost min-h-10 px-4 text-[.85rem]" href={`/product/${existing.slug}`} target="_blank" rel="noopener noreferrer">View in shop <ExternalLink className="h-4 w-4" /></a>}
        </div>
      )}

      <fieldset disabled={readOnly} className="m-0 grid min-w-0 gap-6 border-0 p-0 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 gap-6">
          <Panel title="Details">
            <div className="grid gap-4">
              <Field label="Name" value={p.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} />
              <Field label="Short description" as="textarea" rows={3} value={p.blurb} onChange={(e) => patch({ blurb: e.target.value })} hint="The paragraph under the name on the product page." />
              <Field label="Details">{(fid) => <TagInput id={fid} value={p.details} onChange={(details) => patch({ details })} placeholder="e.g. Squat-tested opaque, then Enter" allowCommas />}</Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fabric" value={p.fabric} onChange={(e) => patch({ fabric: e.target.value })} />
                <Field label="Fit" options={FITS} value={p.fit ?? "true"} onChange={(e) => patch({ fit: e.target.value })} />
              </div>
              <Field label="Fit note" value={p.fitNote} onChange={(e) => patch({ fitNote: e.target.value })} hint="Shown on the product and used by Vee, e.g. Runs small. Size up if between." />
              <Field label="Care" as="textarea" rows={2} value={p.care} onChange={(e) => patch({ care: e.target.value })} />
            </div>
          </Panel>

          <Panel title="Photos">
            <ImageUploader value={p.photos} onChange={(photos) => patch({ photos })} colors={colors.items.filter((c) => p.colorIds.includes(c.id))} label="The first is the card photo; the second shows on hover and in the gallery." />
          </Panel>

          <Panel title="Colours, sizes and stock">
            <VariantMatrix product={p} colors={colors.items} sizes={sizes.items} onChange={patch} />
            {errors.variants && <p role="alert" className="mt-2 text-xs font-semibold text-warn">{errors.variants}</p>}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Status">
            <Field label="Visibility" options={[{ value: "draft", label: "Draft, hidden from the shop" }, { value: "active", label: "Active, on sale" }, { value: "archived", label: "Archived" }]} value={p.status} onChange={(e) => patch({ status: e.target.value })} />
          </Panel>

          <Panel title="Pricing">
            <div className="grid gap-4">
              <Field label="Price (UGX)" inputMode="numeric" value={p.price || ""} onChange={(e) => patch({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })} error={errors.price} />
              <Field label="Sale (% off)" inputMode="numeric" value={p.salePercent ?? ""} onChange={(e) => patch({ salePercent: Math.min(90, Number(e.target.value.replace(/\D/g, ""))) || null })} hint="Shows only while the sale is on (Offers and banners)." />
            </div>
          </Panel>

          <Panel title="Organisation">
            <div className="grid gap-4">
              <Field label="Category" options={[{ value: "", label: "Pick one" }, ...categories.items.map((c) => ({ value: c.id, label: c.name }))]} value={p.categoryId} onChange={(e) => patch({ categoryId: e.target.value })} error={errors.categoryId} />
              <Field label="Label" options={[{ value: "", label: "None" }, { value: "New", label: "New" }, { value: "Bestseller", label: "Bestseller" }]} value={p.badge ?? ""} onChange={(e) => patch({ badge: e.target.value || null })} />
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-2 text-sm font-semibold text-ink-2">Movements</legend>
                <div className="flex flex-wrap gap-1.5">
                  {movements.items.map((a) => {
                    const on = p.movementIds.includes(a.id);
                    return <button key={a.id} type="button" aria-pressed={on} className={cn("chip", on && "is-on")} onClick={() => patch({ movementIds: on ? p.movementIds.filter((x) => x !== a.id) : [...p.movementIds, a.id] })}>{a.name}</button>;
                  })}
                </div>
              </fieldset>
            </div>
          </Panel>

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
