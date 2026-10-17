/* Menu: The Top Bar And The Shop Menu */
import { ImageIcon } from "lucide-react";

import Field from "@/components/ui/Field";
import Photo from "@/components/storefront/Photo";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { categoriesResource, groupsResource, menuFeatureResource, termsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import { shopMenuColumns, topBarLinks } from "@/utils/shopTargets";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

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
  const tile = useDocument(menuFeatureResource);
  const { can } = useAdminAuth();
  const canEdit = can("categories", "edit");
  if (groups.isLoading || categories.isLoading || terms.isLoading || !tile.data) return <PageLoader variant="list" />;

  // Only live groups, categories and items count, as on the shop.
  const lookup = { groups: groups.items.filter((g) => g.active), categories: categories.items.filter((c) => c.active), terms: terms.items.filter((t) => t.active) };
  // The same function the storefront uses to build the Shop menu, so this preview can't drift from the real thing.
  const columns = shopMenuColumns(lookup);
  // The top bar's catalogue links, built the same way as the shop's header.
  const bar = topBarLinks(lookup);
  // Everything that can take a place in the top bar: every category, and the items of the Edits groups.
  const candidates = [
    ...categories.items.map((c) => ({ key: `c-${c.id}`, name: c.name, from: "Category", on: Boolean(c.inHeader), set: (inHeader) => categories.update(c.id, { inHeader }) })),
    ...groups.items.filter((g) => g.kind === "edits").flatMap((g) =>
      terms.items.filter((t) => t.groupId === g.id).map((t) => ({ key: `t-${t.id}`, name: t.name, from: g.name, on: Boolean(t.inHeader), set: (inHeader) => terms.update(t.id, { inHeader }) }))),
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader lede="What shoppers see in the header. It is built from the Shop by groups, so there is nothing to type: switch a group or a link on or off here, and set order and names on Shop by." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
        {/* Top Bar: a preview, then a switch for each thing that can be in it */}
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

        {/* Shop Menu: a preview, then a switch for each group's column */}
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
            <TilePreview tile={tile.data} />
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
        {/* Menu Tile: the picture at the end of the Shop menu */}
        <TileEditor doc={tile} canEdit={canEdit} />
      </div>
    </>
  );
}

/** How the picture tile looks at the end of the menu. */
function TilePreview({ tile }) {
  if (!tile.live) {
    return <div className="grid min-h-32 place-items-center rounded-r-md border border-dashed border-line-2 p-4 text-sm text-ink-3"><span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" aria-hidden="true" /> Tile is off</span></div>;
  }
  return (
    <div className="relative min-h-40 overflow-hidden rounded-r-md bg-[image:var(--brand-grad)] text-white">
      {tile.photo && <div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><Photo photo={tile.photo} label={tile.title} wide /></div>}
      <span className="absolute inset-x-0 bottom-0 grid gap-0.5 bg-gradient-to-t from-black/60 to-transparent p-4">
        <span className="text-[.68rem] font-semibold uppercase tracking-[0.16em] opacity-85">{tile.kicker}</span>
        <strong className="font-display text-lg">{tile.title}</strong>
      </span>
    </div>
  );
}

/**
 * The picture at the end of the Shop menu: upload, replace or take away its
 * photo, change its two lines and its button, or switch it off. Taking the
 * photo away brings back the shoot's own campaign banner.
 */
function TileEditor({ doc, canEdit }) {
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const save = async () => {
    const { photo: _photo, ...stored } = draft;
    commit(await doc.save(stored));
  };
  return (
    <Panel title="Menu tile" hint="The picture at the end of the Shop menu">
      <fieldset disabled={!canEdit} className="m-0 grid gap-4 border-0 p-0 md:grid-cols-[220px_1fr]">
        <ImageUploader single label="Picture" value={draft.photo ? [draft.photo] : []} onChange={(photos) => { set("image", photos[0] ?? null); set("photo", photos[0]); }} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle className="sm:col-span-2" checked={draft.live} onChange={(live) => set("live", live)} label="Showing" hint="Off hides the tile; the menu columns stay." />
          <Field label="Small heading" value={draft.kicker} onChange={(e) => set("kicker", e.target.value)} />
          <Field label="Title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
          <Field label="Button" value={draft.cta} onChange={(e) => set("cta", e.target.value)} />
          <div className="sm:col-span-2"><LinkPicker label="Opens" value={draft} onChange={(patch) => Object.entries(patch).forEach(([k, v]) => set(k, v))} /></div>
        </div>
      </fieldset>
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={save} />}
    </Panel>
  );
}
