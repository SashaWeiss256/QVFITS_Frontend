/* Shop Menu Preview */
import { ImageIcon } from "lucide-react";

import Panel from "@/AdminDashboard/components/Panel";
import { shopMenuColumns } from "@/utils/shopTargets";

/**
 * The Shop menu as shoppers see it right now, built the same way the shop
 * builds it (utils/shopTargets shopMenuColumns): groups set to show in the
 * menu, their live items, then the campaign tile.
 */
export default function MenuPreview({ lookup, campaign }) {
  const live = {
    ...lookup,
    groups: lookup.groups.filter((g) => g.active),
    categories: lookup.categories.filter((c) => c.active),
    terms: lookup.terms.filter((t) => t.active),
  };
  const columns = shopMenuColumns(live);

  return (
    <Panel title="Shop menu" hint="What opens under Shop in the header. It follows the groups below.">
      <div
        className="grid gap-6 overflow-x-auto rounded-r-md border border-line bg-cream p-5 sm:p-6"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(130px, 1fr)) minmax(180px, 1.4fr)` }}
      >
        {columns.map((c) => (
          <div key={c.id} className="min-w-0">
            <p className="m-0 mb-3 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">{c.title}</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {c.links.map((l) => <li key={l.id} className="truncate text-[.92rem] font-medium text-ink" title={l.href}>{l.title}</li>)}
            </ul>
          </div>
        ))}
        {!columns.length && <p className="m-0 text-sm text-ink-3">No group is set to show in the menu.</p>}
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
      </div>
    </Panel>
  );
}
