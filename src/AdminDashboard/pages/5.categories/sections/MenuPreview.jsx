/* Mega Menu Preview */
import { ImageIcon } from "lucide-react";

import Panel from "@/AdminDashboard/components/Panel";
import { targetExists, targetLabel } from "@/utils/shopTargets";

/**
 * The panel as shoppers will see it, from the unsaved draft. A link whose
 * category or movement is switched off shows struck through, since the shop
 * leaves it out until it is back on.
 */
export default function MenuPreview({ menu, lookup, campaign }) {
  // Hidden ones count as missing in the shop, so the preview matches it.
  const live = { ...lookup, categories: lookup.categories.filter((c) => c.active), movements: lookup.movements.filter((m) => m.active) };
  const showFeature = menu.feature === "campaign";

  return (
    <Panel title="Preview" hint="Before saving. Struck-through links are hidden in the shop right now.">
      <div
        className="grid gap-6 overflow-x-auto rounded-r-md border border-line bg-cream p-5 sm:p-6"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, menu.columns.length)}, minmax(130px, 1fr))${showFeature ? " minmax(180px, 1.4fr)" : ""}` }}
      >
        {menu.columns.map((c) => (
          <div key={c.id} className="min-w-0">
            <p className="m-0 mb-3 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">{c.title || "Untitled"}</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {c.links.map((l) => {
                const ok = !l.target || targetExists(l.target, live);
                return (
                  <li key={l.id} className={ok ? "text-[.92rem] font-medium text-ink" : "text-[.92rem] text-ink-4 line-through"}>
                    {l.title || (l.target ? targetLabel(l.target, lookup) : l.href)}
                  </li>
                );
              })}
              {!c.links.length && <li className="text-sm text-ink-4">No links yet</li>}
            </ul>
          </div>
        ))}
        {showFeature && (
          <div className="grid min-h-32 place-items-center rounded-r-md bg-[image:var(--brand-grad)] p-4 text-center text-white">
            {campaign?.live ? (
              <span>
                <span className="block text-[.68rem] font-semibold uppercase tracking-[0.16em] opacity-85">{campaign.kicker}</span>
                <strong className="mt-1 block font-display text-lg">{campaign.title}</strong>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm opacity-90"><ImageIcon className="h-4 w-4" aria-hidden="true" /> Campaign is off</span>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
