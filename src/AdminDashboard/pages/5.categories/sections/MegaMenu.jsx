/* Menu: The Top Bar And The Shop Menu */
import { ImageIcon } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { categoriesResource, groupsResource, termsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { useHomeContent } from "@/store/tanstackStore/queries/site";
import { shopMenuColumns, topBarLinks } from "@/utils/shopTargets";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";

/**
 * The only menu managed here: the Shop menu that opens under Shop, and the
 * few links after it in the top bar. Neither is typed. Both are built from
 * the Shop by groups (the previews use the same functions the shop does),
 * so a switch here is all it takes. Order and names are kept on Shop by.
 */
export default function MegaMenu() {
  const groups = useCollection(groupsResource);
  const categories = useCollection(categoriesResource);
  const terms = useCollection(termsResource);
  const { data: home } = useHomeContent();
  const { can } = useAdminAuth();
  const canEdit = can("categories", "edit");
  if (groups.isLoading || categories.isLoading || terms.isLoading) return <PageLoader />;

  const lookup = { groups: groups.items.filter((g) => g.active), categories: categories.items.filter((c) => c.active), terms: terms.items.filter((t) => t.active) };
  const columns = shopMenuColumns(lookup);
  const bar = topBarLinks(lookup);
  const campaign = home?.campaign;
  // Everything that can take a place in the top bar: every category, and the items of the Edits groups.
  const candidates = [
    ...categories.items.map((c) => ({ key: `c-${c.id}`, name: c.name, from: "Category", on: Boolean(c.inHeader), set: (inHeader) => categories.update(c.id, { inHeader }) })),
    ...groups.items.filter((g) => g.kind === "edits").flatMap((g) =>
      terms.items.filter((t) => t.groupId === g.id).map((t) => ({ key: `t-${t.id}`, name: t.name, from: g.name, on: Boolean(t.inHeader), set: (inHeader) => terms.update(t.id, { inHeader }) }))),
  ];

  return (
    <>
      <PageHeader lede="What shoppers see in the header. It is built from the Shop by groups, so there is nothing to type: switch a group or a link on or off here, and set order and names on Shop by." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <Panel title="Top bar" hint="Shop opens the menu below; these follow it">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-r-md border border-line bg-cream px-5 py-3 text-[.92rem] font-medium">
            <span>Shop</span>
            {bar.map((l) => <span key={l.title}>{l.title}</span>)}
            <span className="text-ink-4">About</span>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {candidates.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 rounded-r-md border border-line px-3 py-2">
                <span className="min-w-0"><strong className="block truncate text-sm">{c.name}</strong><span className="text-xs text-ink-4">{c.from}</span></span>
                <Toggle checked={c.on} onChange={c.set} label="In the top bar" disabled={!canEdit} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Shop menu" hint="What opens under Shop">
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
                <span className="flex items-center gap-2 text-sm opacity-90"><ImageIcon className="h-4 w-4" aria-hidden="true" /> No campaign</span>
              )}
            </div>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {groups.items.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 rounded-r-md border border-line px-3 py-2">
                <strong className="truncate text-sm">{g.name}</strong>
                <Toggle checked={g.inMenu} onChange={(inMenu) => groups.update(g.id, { inMenu })} label="A column" disabled={!canEdit} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
