/* Vee Settings */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { settingsResource, useDocument } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import TagInput from "@/AdminDashboard/components/TagInput";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

export default function VeeSettings() {
  const doc = useDocument(settingsResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const canEdit = can("vee", "edit");
  // Only Vee's own settings are edited here, so a save never touches the rest of Settings.
  const { draft, set, dirty, reset, commit } = useDraft(doc.data.assistant);

  return (
    <>
      <fieldset disabled={!canEdit} className="m-0 grid gap-6 border-0 p-0">
        {/* The Assistant: on or off, her name and her greeting */}
        <Panel title="The assistant">
          <div className="grid gap-4">
            <Toggle checked={draft.enabled} onChange={(enabled) => set("enabled", enabled)} label="Showing on the shop" hint="Off removes her button from every page." />
            <Field label="Name" className="max-w-xs" value={draft.name} onChange={(e) => set("name", e.target.value)} />
            <Field label="Greeting" as="textarea" rows={2} value={draft.greeting} onChange={(e) => set("greeting", e.target.value)} hint="Her first message. Once a shopper has told her their name she greets them by it instead." />
          </div>
        </Panel>
        {/* Starter Questions: the buttons shown before a shopper types */}
        <Panel title="Starter questions" hint="The buttons shoppers can tap before they type">
          <Field label="Questions">{(id) => <TagInput id={id} value={draft.chips} onChange={(chips) => set("chips", chips)} placeholder="Something for the gym" />}</Field>
        </Panel>
      </fieldset>
      {/* Save Bar: shown only to someone who may edit */}
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit((await doc.save({ assistant: draft })).assistant)} />}
    </>
  );
}
