/* Menu Editor */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { navigationResource, useDocument } from "@/store/tanstackStore/queries/admin";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import TagInput from "@/AdminDashboard/components/TagInput";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

const MENUS = [
  ["header", "Header links", "After Shop, in the top bar and the phone menu."],
  ["shopEdits", "Shop menu shortcuts", "At the top of the Shop menu."],
  ["help", "Help links", "In the footer, the phone menu and the Shop menu."],
  ["legal", "Legal links", "The footer's Legal column."],
];

// Every menu on the site. Categories and activities join the Shop menu on
// their own, from Catalog.
export default function MenuEditor({ canEdit }) {
  const doc = useDocument(navigationResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} canEdit={canEdit} />;
}

function Editor({ doc, canEdit }) {
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  return (
    <fieldset disabled={!canEdit} className="m-0 grid gap-6 border-0 p-0">
      {MENUS.map(([key, title, hint]) => (
        <Panel key={key} title={title}>
          <p className="mt-0 text-sm text-ink-3">{hint}</p>
          <ListEditor
            items={draft[key].map((l, i) => ({ ...l, id: i }))}
            onChange={(items) => set(key, items.map(({ title: t, path }) => ({ title: t, path })))}
            newItem={() => ({ id: Date.now(), title: "", path: "/" })}
            addLabel="Add a link"
            itemLabel={(l) => l.title || "New link"}
            render={(l, update) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Text" value={l.title} onChange={(e) => update({ title: e.target.value })} />
                <Field label="Goes to" value={l.path} onChange={(e) => update({ path: e.target.value })} hint="/shop?c=Swim, /about…" />
              </div>
            )}
          />
        </Panel>
      ))}
      <Panel title="Popular searches">
        <Field label="Suggested in the search box before anything is typed">{(id) => <TagInput id={id} value={draft.popularSearches} onChange={(v) => set("popularSearches", v)} />}</Field>
      </Panel>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </fieldset>
  );
}
