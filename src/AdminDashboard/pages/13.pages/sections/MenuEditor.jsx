/* Menu Editor */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { navigationResource, useDocument } from "@/store/tanstackStore/queries/admin";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import TagInput from "@/AdminDashboard/components/TagInput";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

const MENUS = [
  ["header", "Header links", "After Shop, in the top bar and the phone menu."],
  ["help", "Help links", "In the footer and the phone menu."],
  ["legal", "Legal links", "The footer's Legal column."],
];
// The keys this editor owns; the Shop menu in the same document has its own page.
const OWN = [...MENUS.map(([key]) => key), "popularSearches"];

// Every menu on the site except the Shop mega menu (Website, Mega menu).
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
            onChange={(items) => set(key, items.map(({ id: _id, ...link }) => link))}
            newItem={() => ({ id: Date.now(), title: "", target: { page: "/" } })}
            addLabel="Add a link"
            itemLabel={(l) => l.title || "New link"}
            render={(l, update) => (
              <div className="grid gap-3">
                <Field label="Text" value={l.title} onChange={(e) => update({ title: e.target.value })} />
                <LinkPicker value={l} onChange={update} />
              </div>
            )}
          />
        </Panel>
      ))}
      <Panel title="Popular searches">
        <Field label="Suggested in the search box before anything is typed">{(id) => <TagInput id={id} value={draft.popularSearches} onChange={(v) => set("popularSearches", v)} />}</Field>
      </Panel>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(Object.fromEntries(OWN.map((k) => [k, draft[k]]))))} />
    </fieldset>
  );
}
