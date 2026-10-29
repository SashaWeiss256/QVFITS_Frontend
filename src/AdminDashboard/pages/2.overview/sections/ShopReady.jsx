/* Overview Shop Ready */
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import {
  categoriesResource,
  colorsResource,
  paymentMethodsResource,
  productsResource,
  settingsResource,
  shippingResource,
  sizesResource,
  useCollection,
  useDocument,
} from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";
import Panel from "@/AdminDashboard/components/Panel";

/**
 * Get the shop ready: the setup in the order it is done, each step a link
 * to where it is done. It folds away once every step is ticked, so a
 * running shop never sees it.
 */
export default function ShopReady() {
  const categories = useCollection(categoriesResource).items;
  const colors = useCollection(colorsResource).items;
  const sizes = useCollection(sizesResource).items;
  const products = useCollection(productsResource);
  const zones = useCollection(shippingResource).items;
  const methods = useCollection(paymentMethodsResource).items;
  const { data: settings } = useDocument(settingsResource);
  if (products.isLoading || !settings) return null;

  // Only published pieces count as "a product in the shop".
  const live = products.items.filter((p) => p.status === "active");
  // The setup in the order it is done, each step a link to where it is done.
  const steps = [
    { label: "Categories", done: categories.some((c) => c.active), to: "/admin/categories" },
    { label: "Colours", done: colors.length > 0, to: "/admin/categories?tab=colours" },
    { label: "Sizes", done: sizes.length > 0, to: "/admin/size-guide?tab=sizes" },
    { label: "A product in the shop", done: live.length > 0, to: "/admin/products" },
    { label: "Delivery areas", done: zones.some((z) => z.active), to: "/admin/settings?tab=delivery" },
    { label: "Ways to pay", done: methods.some((m) => m.active), to: "/admin/settings?tab=payments" },
    { label: "Contact details", done: Boolean(settings.phone && settings.whatsapp && settings.email), to: "/admin/settings?tab=contact" },
  ];
  const done = steps.filter((s) => s.done).length;
  // Once everything is set up the card disappears for good.
  if (done === steps.length) return null;

  {/* Get The Shop Ready: a progress bar, then the steps */}
  return (
    <Panel title="Get the shop ready" hint={`${done} of ${steps.length} done`}>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-cream-2" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Setup progress">
        <div className="h-full rounded-full bg-[image:var(--brand-grad)] transition-[width] duration-500 ease-q" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      {/* Steps: a tick when done, a number when not */}
      <ol className="m-0 grid list-none gap-1 p-0 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.label}>
            <Link to={s.to} className="group flex min-h-11 items-center gap-3 rounded-[14px] px-3 outline-none transition-[background-color] duration-200 ease-q hover:bg-cream-2 focus-visible:ring-2 focus-visible:ring-brand-300">
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[.72rem] font-bold", s.done ? "bg-success/15 text-success" : "border border-line-2 text-ink-3")}>
                {s.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("flex-1 text-sm", s.done ? "text-ink-4 line-through" : "text-ink-2")}>{s.label}</span>
              {!s.done && <ArrowRight className="h-4 w-4 text-ink-4 transition-[transform,color] duration-200 ease-q group-hover:translate-x-0.5 group-hover:text-brand-500" aria-hidden="true" />}
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
