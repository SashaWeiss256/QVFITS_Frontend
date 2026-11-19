/* Shop By Movement Tiles */
import Field from "@/components/ui/Field";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";

const newTile = () => ({ id: `movement-${Date.now().toString(36)}`, label: "", target: {} });

/**
 * The row of tall photos under the hero. Each tile is a photo, a name and
 * the part of the shop it opens. A tile with no name or photo of its own
 * borrows them from what it opens, so a new one is never blank.
 */
export default function MovementTiles({ movements, onChange }) {
  return (
    <Panel title="Shop by movement" hint="The row of tall photos on the home page, in this order.">
      <Field className="mb-5 max-w-md" label="Section title" value={movements.title} maxLength={40} onChange={(e) => onChange({ ...movements, title: e.target.value })} />
      <ListEditor
        items={movements.items}
        onChange={(items) => onChange({ ...movements, items })}
        max={6}
        addLabel="Add a tile"
        newItem={newTile}
        itemLabel={(t, i) => t.label || `Tile ${i + 1}`}
        render={(t, update) => (
          <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
            <ImageUploader single folder="content" label="Photo" value={t.photo ? [t.photo] : []} onChange={(photos) => update({ image: photos[0] ?? null, photo: photos[0] })} />
            <div className="grid content-start gap-4">
              <Field label="Name" value={t.label ?? ""} maxLength={24} placeholder="Taken from where it goes" hint="Left empty, it uses the name of what it opens." onChange={(e) => update({ label: e.target.value })} />
              <LinkPicker label="Opens" value={t} onChange={update} />
              {!t.photo && <p className="m-0 text-xs text-ink-4">No photo yet: the shop shows the photo of what it opens.</p>}
            </div>
          </div>
        )}
      />
    </Panel>
  );
}
