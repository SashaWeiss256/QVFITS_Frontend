/* Admin FAQ */
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { faqResource, useCollection } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

const BLANK = { q: "", a: "", group: "General" };

/** The questions on the contact page, in this order. Vee reads them too. */
export default function AdminFaq() {
  const faq = useCollection(faqResource);
  const { can } = useAdminAuth();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const canEdit = can("faq", "edit");
  const list = faq.items;
  const groups = [...new Set(list.map((f) => f.group))];

  const move = (i, by) => {
    const ids = list.map((f) => f.id);
    const [id] = ids.splice(i, 1);
    ids.splice(i + by, 0, id);
    faq.reorder(ids);
  };

  const save = async () => {
    if (editing.id) await faq.update(editing.id, editing);
    else await faq.create(editing);
    setEditing(null);
  };

  return (
    <>
      <PageHeader lede="The questions on the contact page, in this order." action={canEdit && <Button onClick={() => setEditing(BLANK)}><Plus className="h-4 w-4" aria-hidden="true" /> Add question</Button>} />
      <Panel>
        <ul className="m-0 list-none p-0">
          {list.map((f, i) => (
            <li key={f.id} className="flex items-start gap-3 border-b border-line py-3 last:border-0">
              {canEdit && (
                <span className="flex flex-col">
                  <button type="button" className="icon-btn h-7 min-h-0" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className="icon-btn h-7 min-h-0" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                </span>
              )}
              <div className="min-w-0 flex-1">
                <strong>{f.q}</strong>
                <p className="m-0 mt-1 line-clamp-2 text-sm text-ink-3">{f.a}</p>
                {groups.length > 1 && <span className="text-xs text-brand-600">{f.group}</span>}
              </div>
              {canEdit && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={() => setEditing(f)}>Edit</button>}
              {can("faq", "delete") && <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm text-warn" onClick={() => setRemoving(f)}>Delete</button>}
            </li>
          ))}
        </ul>
        {!list.length && !faq.isLoading && <p className="py-8 text-center text-ink-3">No questions yet.</p>}
      </Panel>
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit question" : "New question"}
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={faq.isSaving} disabled={!editing?.q.trim() || !editing?.a.trim()}>Save</Button></div>}
      >
        {editing && (
          <div className="grid gap-4">
            <Field label="Question" value={editing.q} onChange={(e) => setEditing({ ...editing, q: e.target.value })} />
            <Field label="Answer" as="textarea" rows={5} value={editing.a} onChange={(e) => setEditing({ ...editing, a: e.target.value })} />
            <Field label="Group" value={editing.group} onChange={(e) => setEditing({ ...editing, group: e.target.value })} list="faq-groups" hint="e.g. Delivery, Sizing. Optional." />
            <datalist id="faq-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={Boolean(removing)} onClose={() => setRemoving(null)} itemName={removing?.q} loading={faq.isRemoving} onConfirm={() => faq.remove(removing.id).then(() => setRemoving(null))} />
    </>
  );
}
