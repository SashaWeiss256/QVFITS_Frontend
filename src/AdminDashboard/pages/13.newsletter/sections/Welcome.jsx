/* Newsletter Welcome Email */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { discountsResource, newsletterSettingsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";

/**
 * The email a new subscriber gets once they confirm, with an optional
 * discount code; each address gets it once, ever. Also the consent words
 * shown under every signup form and stored with each address.
 */
export default function Welcome() {
  const doc = useDocument(newsletterSettingsResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const codes = useCollection(discountsResource).items.filter((d) => d.active);
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const w = draft.welcome;
  const setW = (patch) => set("welcome", { ...w, ...patch });

  return (
    <>
      <PageHeader lede="What a new subscriber receives once they confirm, and the words they agree to when they join." />
      <fieldset disabled={!can("newsletter", "edit")} className="m-0 grid gap-6 border-0 p-0">
        <Panel title="Welcome email">
          <div className="grid gap-4">
            <Toggle checked={w.enabled} onChange={(enabled) => setW({ enabled })} label="Send a welcome email" hint="Once per address, even if they leave and join again." />
            <Field label="Discount code in it" options={[{ value: "", label: "No code" }, ...codes.map((d) => ({ value: d.code, label: `${d.code}${d.description ? ` (${d.description})` : ""}` }))]} value={w.code} onChange={(e) => setW({ code: e.target.value })} hint="Only switched-on codes are offered. Make one under Discount codes, e.g. one use per shopper." />
            <Field label="Subject line" value={w.subject} onChange={(e) => setW({ subject: e.target.value })} />
            <Field label="Heading" value={w.heading} onChange={(e) => setW({ heading: e.target.value })} />
            <Field label="Message" as="textarea" rows={4} value={w.body} onChange={(e) => setW({ body: e.target.value })} />
          </div>
        </Panel>
        <Panel title="Consent wording" hint="Shown under every signup form and kept with each address, as the record of what they agreed to.">
          <Field label="What they agree to" as="textarea" rows={3} value={draft.consentText} onChange={(e) => set("consentText", e.target.value)} />
        </Panel>
      </fieldset>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </>
  );
}
