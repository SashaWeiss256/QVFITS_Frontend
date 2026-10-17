/* Shop By Item Dialog */
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import { slugify, targetHref } from "@/utils/shopTargets";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import Toggle from "@/AdminDashboard/components/Toggle";

/**
 * Add or edit one item of a group. A category or a tag has a picture, a
 * web address and a line that heads its shop page. An edit is a name and
 * what it opens (New in, the size guide, Bras for running…).
 */
export default function ItemDialog({ dialog, onChange, onClose, onSave, saving, lookup }) {
  const group = dialog?.group;
  const x = dialog?.value;
  const set = (patch) => onChange({ ...dialog, value: { ...x, ...patch } });
  const slug = x?.slug || slugify(x?.name);
  const path =
    group?.kind === "category" ? `/shop/${slug || "…"}` : group?.kind === "tags" ? `/shop/${group.slug}/${slug || "…"}` : x?.target ? targetHref(x.target, lookup) : "";

  return (
    <Modal
      isOpen={Boolean(dialog)}
      onClose={onClose}
      title={x?.id ? `Edit ${x.name}` : `Add to ${group?.name ?? ""}`}
      footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(dialog)} loading={saving} disabled={!x?.name.trim()}>Save</Button></div>}
    >
      {x && group.kind === "edits" && (
        <div className="grid gap-4">
          <Field label="Name" value={x.name} placeholder="New in" onChange={(e) => set({ name: e.target.value })} autoFocus />
          <LinkPicker label="Shows" value={x} onChange={set} />
          <Toggle checked={x.active} onChange={(active) => set({ active })} label="In the Shop menu" />
        </div>
      )}

      {x && group.kind !== "edits" && (
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <ImageUploader single label="Picture" value={x.photo ? [x.photo] : []} onChange={(photos) => set({ image: photos[0] ?? null, photo: photos[0] ?? null })} />
          <div className="grid content-start gap-4">
            <Field label="Name" value={x.name} placeholder={group.kind === "category" ? "Bras" : "High support"} onChange={(e) => set({ name: e.target.value })} autoFocus />
            <Field label="Web address" value={x.slug} placeholder={slugify(x.name)} onChange={(e) => set({ slug: slugify(e.target.value) })} hint={`${path}. Changing it keeps the old address working.`} />
          </div>
          <Field className="sm:col-span-2" label="Description" as="textarea" rows={2} value={x.description} onChange={(e) => set({ description: e.target.value })} hint="Heads its shop page, under the title." />
          <Toggle className="sm:col-span-2" checked={x.active} onChange={(active) => set({ active })} label="Show in the shop" hint="Off hides its page, menu link and filter chip; products keep it." />
        </div>
      )}
    </Modal>
  );
}
