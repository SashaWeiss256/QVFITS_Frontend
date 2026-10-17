/* Admin Settings */
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { settingsResource, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Tabs from "@/AdminDashboard/components/Tabs";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import { useTab } from "@/AdminDashboard/lib/useTab";
import DeliveryZones from "./sections/DeliveryZones";
import PaymentMethods from "./sections/PaymentMethods";
import SettingsFields, { Currencies } from "./sections/SettingsFields";
import { GROUPS } from "./settingsGroups";

const TABS = [
  { id: "shop", label: "Shop details" },
  { id: "contact", label: "Contact and social" },
  { id: "delivery", label: "Delivery" },
  { id: "payments", label: "Payments" },
  { id: "currencies", label: "Currencies" },
  { id: "policies", label: "Stock and policies" },
  { id: "display", label: "Shop display" },
  { id: "assistant", label: "Vee" },
];

/** The shop's details, fees and rules. The storefront reads them everywhere. */
export default function AdminSettings() {
  const doc = useDocument(settingsResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  // In the URL, so Overview's checklist can open Delivery or Payments directly.
  const [tab, setTab] = useTab(TABS);
  const { can } = useAdminAuth();
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const canEdit = can("settings", "edit");

  const save = async () => {
    const { zones: _zones, ...rest } = draft;
    commit(await doc.save(rest));
  };

  return (
    <>
      <PageHeader lede="Shop details, delivery, payments and the rules the shop runs on." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <fieldset disabled={!canEdit} className="m-0 grid gap-6 border-0 p-0">
        {GROUPS[tab] && <SettingsFields groups={GROUPS[tab]} draft={draft} set={set} />}
        {tab === "delivery" && (
          <>
            <Panel title="Free delivery">
              <Field label="Free delivery over (UGX)" className="max-w-xs" inputMode="numeric" value={draft.freeShippingOver} onChange={(e) => set("freeShippingOver", Number(e.target.value.replace(/\D/g, "")) || 0)} hint="For every zone that does not set its own." />
            </Panel>
            <DeliveryZones canEdit={canEdit} shopFreeOver={draft.freeShippingOver} />
          </>
        )}
        {tab === "payments" && <PaymentMethods canEdit={canEdit} />}
        {tab === "currencies" && <Currencies draft={draft} set={set} />}
        {tab === "display" && (
          <Panel title="Products per row" hint="How the shop grid starts on each screen. Shoppers can switch between the two sizes their screen offers.">
            <div className="grid gap-4 sm:grid-cols-3">
              {[["phone", "Phones", [1, 2]], ["tablet", "Tablets", [2, 3]], ["desktop", "Laptops and desktops", [3, 4]]].map(([key, label, choices]) => (
                <Field
                  key={key}
                  label={label}
                  options={choices.map((n) => ({ value: n, label: `${n} per row` }))}
                  value={draft.shopGrid?.[key] ?? choices[1]}
                  onChange={(e) => set("shopGrid", { ...draft.shopGrid, [key]: Number(e.target.value) })}
                />
              ))}
            </div>
          </Panel>
        )}
        {tab === "assistant" && (
          <Panel title="Vee, the style assistant">
            <div className="grid gap-4">
              <Field label="Name" className="max-w-xs" value={draft.assistant.name} onChange={(e) => set("assistant", { ...draft.assistant, name: e.target.value })} />
              <Field label="Greeting" as="textarea" rows={2} value={draft.assistant.greeting} onChange={(e) => set("assistant", { ...draft.assistant, greeting: e.target.value })} />
            </div>
          </Panel>
        )}
      </fieldset>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={save} />
    </>
  );
}
