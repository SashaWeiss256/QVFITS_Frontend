/* Seen On You Reels */
import Field from "@/components/ui/Field";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";
import ReelVideo from "./ReelVideo";

const newReel = () => ({ id: `reel-${Date.now().toString(36)}`, label: "", target: {}, video: null });

/**
 * The short reels near the foot of the home page (and on their own page).
 * Each is a still, a clip that plays while it is on screen, a caption and
 * the piece or part of the shop it links to. A reel with no clip shows its
 * still. Best in portrait.
 */
export default function SeenOnYou({ feed, onChange }) {
  const set = (patch) => onChange({ ...feed, ...patch });
  return (
    <Panel title="Seen on you" hint="Short reels that link through to what is worn.">
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <Toggle className="sm:col-span-2" checked={feed.live} onChange={(live) => set({ live })} label="Showing on the home page" hint="Off hides the whole section." />
        <Field label="Title" value={feed.title} maxLength={40} onChange={(e) => set({ title: e.target.value })} />
        <Field label="Line under it" value={feed.kicker} maxLength={60} onChange={(e) => set({ kicker: e.target.value })} />
      </div>
      <ListEditor
        items={feed.items}
        onChange={(items) => set({ items })}
        max={8}
        addLabel="Add a reel"
        newItem={newReel}
        itemLabel={(it, i) => it.label || `Reel ${i + 1}`}
        render={(it, update) => (
          <div className="grid gap-5 md:grid-cols-[180px_180px_minmax(0,1fr)]">
            {/* A new still replaces the shoot's clip as well, unless a clip of its own is added */}
            <ImageUploader
              single
              folder="content"
              label="Still"
              value={it.photo ? [it.photo] : []}
              onChange={(photos) => update({ image: photos[0] ?? null, photo: photos[0], ...(it.video === undefined ? { clip: undefined } : {}) })}
            />
            <ReelVideo reel={it} update={update} />
            <div className="grid content-start gap-4">
              <Field label="Caption" value={it.label} maxLength={40} placeholder="Pilates, in pink" onChange={(e) => update({ label: e.target.value })} />
              <LinkPicker label="Links to" value={it} onChange={update} />
            </div>
          </div>
        )}
      />
    </Panel>
  );
}
