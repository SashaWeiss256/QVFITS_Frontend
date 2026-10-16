/* Payment Methods */
import Field from "@/components/ui/Field";
import { paymentMethodsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";

// How shoppers can pay, and what checkout says about each. Switching one on
// is a promise: card payments need the gateway connected first.
export default function PaymentMethods({ canEdit }) {
  const methods = useCollection(paymentMethodsResource);
  return (
    <Panel title="Payment methods">
      <ul className="m-0 grid list-none gap-4 p-0">
        {methods.items.map((m) => (
          <li key={m.id} className="grid gap-3 rounded-r-md border border-line bg-white p-4 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
            <Toggle checked={m.active} disabled={!canEdit} onChange={(active) => methods.update(m.id, { active })} label={m.label} />
            <Field label="Name at checkout" disabled={!canEdit} defaultValue={m.label} onBlur={(e) => e.target.value !== m.label && methods.update(m.id, { label: e.target.value })} />
            <Field label="Help text" disabled={!canEdit} defaultValue={m.instructions} onBlur={(e) => e.target.value !== m.instructions && methods.update(m.id, { instructions: e.target.value })} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
