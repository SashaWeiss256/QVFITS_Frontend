/* Link Picker */
import { useId } from "react";

import Field from "@/components/ui/Field";
import { categoriesResource, groupsResource, productsResource, termsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import { LABELS, PAGES, targetHref, targetLabel } from "@/utils/shopTargets";

const KINDS = [
  { value: "shop", label: "Part of the shop" },
  { value: "product", label: "One piece" },
  { value: "page", label: "A page" },
];

const kindOf = (link) =>
  link.href === null && !link.target ? "whatsapp" : link.target?.product ? "product" : link.target?.page ? "page" : "shop";

/**
 * Where a link goes, picked from what exists rather than typed: a part of
 * the shop (a category, items from any "Shop by" group, a label, or a mix
 * such as Bras for running), one piece, or a fixed page. The link stores the choice as a
 * target (utils/shopTargets), so renaming a category never breaks it.
 * Nothing is ever typed: there is no "another address". `whatsapp` adds
 * "WhatsApp chat" (a null href) for the deal cards.
 *
 *   <LinkPicker value={slide} onChange={(patch) => update(patch)} />
 */
export default function LinkPicker({ value, onChange, label = "Goes to", whatsapp = false }) {
  const id = useId();
  const categories = useCollection(categoriesResource).items;
  const groups = useCollection(groupsResource).items.filter((g) => g.kind === "tags");
  const terms = useCollection(termsResource).items;
  const products = useCollection(productsResource).items;
  const lookup = { categories, groups, terms, products };
  const kind = kindOf(value);
  const t = value.target ?? {};

  // A target and a typed href never sit together: the target is the truth.
  const setTarget = (target) => onChange({ target, href: undefined });
  const setKind = (next) => {
    if (next === "shop") setTarget({});
    else if (next === "product") setTarget({ product: products[0]?.id });
    else if (next === "page") setTarget({ page: PAGES[0].path });
    else onChange({ target: undefined, href: null });
  };
  const shop = (patch) => {
    const next = { ...t, ...patch };
    for (const k of ["categories", "terms"]) if (!next[k]?.length) delete next[k];
    if (!next.label) delete next.label;
    setTarget(next);
  };

  const kinds = whatsapp ? [...KINDS, { value: "whatsapp", label: "WhatsApp chat" }] : KINDS;

  return (
    <fieldset className="m-0 grid gap-3 rounded-r-md border border-line bg-cream/60 p-3 sm:p-4">
      <legend className="sr-only">{label}</legend>
      <Field label={label} options={kinds} value={kind} onChange={(e) => setKind(e.target.value)} />

      {kind === "shop" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Category"
            options={[{ value: "", label: "Any category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            value={t.categories?.[0] ?? ""}
            onChange={(e) => shop({ categories: e.target.value ? [e.target.value] : [] })}
          />
          <Field
            label="Only"
            options={[{ value: "", label: "Everything in it" }, ...Object.entries(LABELS).map(([k, l]) => ({ value: k, label: l.name }))]}
            value={t.label ?? ""}
            onChange={(e) => shop({ label: e.target.value })}
          />
          {/* One row of chips per "Shop by" group: Movement, Fit… */}
          {groups.map((g) => (
            <div key={g.id} className="grid gap-1.5 sm:col-span-2">
              <span id={`${id}-${g.id}`} className="text-sm font-semibold text-ink-2">{g.name}</span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`${id}-${g.id}`}>
                {terms.filter((x) => x.groupId === g.id).map((x) => {
                  const on = t.terms?.includes(x.id) ?? false;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      aria-pressed={on}
                      className={cn("chip", on && "is-on")}
                      onClick={() => shop({ terms: on ? t.terms.filter((v) => v !== x.id) : [...(t.terms ?? []), x.id] })}
                    >
                      {x.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {kind === "product" && (
        <Field label="Piece" options={products.map((p) => ({ value: p.id, label: p.name }))} value={t.product ?? ""} onChange={(e) => setTarget({ product: e.target.value })} />
      )}

      {kind === "page" && (
        <Field label="Page" options={PAGES.map((p) => ({ value: p.path, label: p.name }))} value={t.page} onChange={(e) => setTarget({ page: e.target.value })} />
      )}

      {/* What the shopper gets, so a pick can be checked before saving. */}
      {value.target && (
        <p className="m-0 flex flex-wrap items-center gap-x-2 text-[.8rem] text-ink-3">
          <span className="font-semibold text-ink-2">{targetLabel(value.target, lookup)}</span>
          <code className="rounded-r-sm bg-white px-1.5 py-0.5 text-[.75rem] text-brand-600">{targetHref(value.target, lookup)}</code>
        </p>
      )}
    </fieldset>
  );
}
