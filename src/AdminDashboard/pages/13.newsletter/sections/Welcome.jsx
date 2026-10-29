/* Newsletter Welcome Email */
import { Gift, MailCheck, Power, ShieldCheck } from "lucide-react";

import EmailPreview from "@/AdminDashboard/components/EmailPreview";
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { discountsResource, newsletterSettingsResource, useCollection, useDocument, useOutbox } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";
import { Block, StatRow, count } from "../parts";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Toggle from "@/AdminDashboard/components/Toggle";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import { formatDate } from "@/utils/format";

/**
 * The email a new subscriber gets once they confirm, with an optional
 * discount code; each address gets it once, ever. Also the consent words
 * shown under every signup form and stored with each address.
 */
export default function Welcome() {
  const doc = useDocument(newsletterSettingsResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  // Only codes that are switched on can be put in the email, so it never offers one checkout would refuse.
  const codes = useCollection(discountsResource).items.filter((d) => d.active);
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const w = draft.welcome;
  // Changes the welcome email and leaves the consent wording alone.
  const setW = (patch) => set("welcome", { ...w, ...patch });

  const sent = useOutbox().data?.filter((m) => m.kind === "newsletter-welcome" && m.status === "sent") ?? [];
  const last = sent.map((m) => m.createdAt).sort().at(-1);
  const code = codes.find((d) => d.code === w.code);

  return (
    <>
      <PageHeader lede="What a new subscriber receives once they confirm, and the words they agree to when they join. Edit on the left; the email updates on the right as you type." />
      <StatRow label="Welcome email">
        <StatCard label="Welcome email" icon={Power} value={w.enabled ? "On" : "Off"} note={w.enabled ? "Sent once per address" : "Nothing is sent"} />
        <StatCard label="Discount code" icon={Gift} value={w.code || "None"} note={code ? (code.description || "Switched on") : w.code ? "Switched off: not offered" : "Add one to lift first orders"} />
        <StatCard label="Welcomes sent" icon={MailCheck} value={sent.length} note={last ? `Last on ${formatDate(last)}` : "None yet"} />
        <StatCard label="Consent kept" icon={ShieldCheck} value="Every address" note="Words stored with each sign up" />
      </StatRow>

      <fieldset disabled={!can("newsletter", "edit")} className="m-0 grid min-w-0 items-start gap-6 border-0 p-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        {/* The form: three steps, each in its own block */}
        <Panel title="Write the email" hint="Sent once to each address after it confirms, even if they leave and join again.">
          <div className="grid gap-7">
            <Block title="Send it">
              <Toggle checked={w.enabled} onChange={(enabled) => setW({ enabled })} label="Send a welcome email" hint="Turn off to stop it without losing your wording." />
              <Field label="Discount code in it" options={[{ value: "", label: "No code" }, ...codes.map((d) => ({ value: d.code, label: `${d.code}${d.description ? ` (${d.description})` : ""}` }))]} value={w.code} onChange={(e) => setW({ code: e.target.value })} hint="Only switched on codes are offered. Make one under Discount codes, for example one use per shopper." />
            </Block>
            <Block title="What it says" hint="The subject is what shows in the inbox, so keep it short.">
              <Field label="Subject line" value={w.subject} onChange={(e) => setW({ subject: e.target.value })} hint={count(w.subject, 60)} />
              <Field label="Heading" value={w.heading} onChange={(e) => setW({ heading: e.target.value })} />
              <Field label="Message" as="textarea" rows={4} value={w.body} onChange={(e) => setW({ body: e.target.value })} />
            </Block>
            {/* Consent: the words under every signup form, kept with each address as the record of what they agreed to */}
            <Block title="Consent wording" hint="Shown under every signup form and kept with each address, as the record of what they agreed to.">
              <Field label="What they agree to" as="textarea" rows={3} value={draft.consentText} onChange={(e) => set("consentText", e.target.value)} />
            </Block>
          </div>
        </Panel>

        {/* Preview: follows every keystroke; stays in view while the form scrolls */}
        <Panel title="Preview" hint="How it looks in an inbox." className="xl:sticky xl:top-24">
          <EmailPreview subject={w.subject} heading={w.heading} body={w.body} code={code} />
        </Panel>
      </fieldset>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(draft))} />
    </>
  );
}
