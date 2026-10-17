/* Home Sections */
import Field from "@/components/ui/Field";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";

// Shop by movement, the campaign, the press row, the feed and the newsletter
// box, in the order they sit on the page. `set(key, value)` updates one.
export default function HomeSections({ draft, set, movements: all }) {
  const { movements, campaign, press, feed, newsletter } = draft;

  return (
    <>
      <Panel title="Shop by movement">
        <Field label="Heading" className="mb-4" value={movements.title} onChange={(e) => set("movements", { ...movements, title: e.target.value })} />
        <ListEditor
          items={movements.items}
          onChange={(items) => set("movements", { ...movements, items })}
          max={6}
          addLabel="Add a tile"
          newItem={() => ({ id: `tile-${Date.now().toString(36)}`, target: { movements: all[0] ? [all[0].id] : [] }, image: null })}
          itemLabel={(m) => m.label || "New tile"}
          render={(m, update) => {
            // A tile opens one or more movements; its words and picture default to the first one's.
            const ids = m.target?.movements ?? [];
            const first = all.find((x) => x.id === ids[0]);
            return (
              <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                <ImageUploader single label="Picture" value={m.photo ? [m.photo] : []} onChange={(photos) => update({ image: photos[0] ?? null, photo: photos[0] })} />
                <div className="grid gap-3">
                  <fieldset className="m-0 border-0 p-0">
                    <legend className="mb-1.5 text-sm font-semibold text-ink-2">Opens</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {all.map((a) => {
                        const on = ids.includes(a.id);
                        return (
                          <button key={a.id} type="button" aria-pressed={on} className={`chip ${on ? "is-on" : ""}`}
                            onClick={() => update({ target: { movements: on ? ids.filter((x) => x !== a.id) : [...ids, a.id] }, href: undefined })}>{a.name}</button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <Field label="Label" value={m.label ?? ""} placeholder={first?.name ?? ""} onChange={(e) => update({ label: e.target.value })} hint="Leave empty to use the movement's name. No picture uses the movement's photo." />
                </div>
              </div>
            );
          }}
        />
      </Panel>

      <Panel title="Campaign">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <ImageUploader single label="Picture" value={campaign.photo ? [campaign.photo] : []} onChange={(photos) => set("campaign", { ...campaign, image: photos[0] ?? null, photo: photos[0] })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle className="sm:col-span-2" checked={campaign.live} onChange={(live) => set("campaign", { ...campaign, live })} label="Showing" />
            <Field label="Small heading" value={campaign.kicker} onChange={(e) => set("campaign", { ...campaign, kicker: e.target.value })} />
            <Field label="Title" value={campaign.title} onChange={(e) => set("campaign", { ...campaign, title: e.target.value })} />
            <Field label="Button" value={campaign.cta} onChange={(e) => set("campaign", { ...campaign, cta: e.target.value })} />
            <div className="sm:col-span-2">
              <LinkPicker label="Button goes to" value={campaign} onChange={(patch) => set("campaign", { ...campaign, ...patch })} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Press row">
        <Toggle checked={press.live} onChange={(live) => set("press", { ...press, live })} label="Showing" hint="Only list real mentions you can link to." className="mb-4" />
        <Field label="Heading" className="mb-4" value={press.title} onChange={(e) => set("press", { ...press, title: e.target.value })} />
        <ListEditor
          items={press.items}
          onChange={(items) => set("press", { ...press, items })}
          addLabel="Add a mention"
          newItem={() => ({ name: "", href: "" })}
          itemLabel={(p) => p.name || "New mention"}
          render={(p, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={p.name} onChange={(e) => update({ name: e.target.value })} />
              <Field label="Link" value={p.href ?? ""} onChange={(e) => update({ href: e.target.value })} />
            </div>
          )}
        />
      </Panel>

      <Panel title="Seen on you (reels)">
        <Toggle checked={feed.live} onChange={(live) => set("feed", { ...feed, live })} label="Showing" className="mb-4" />
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Small heading" value={feed.kicker} onChange={(e) => set("feed", { ...feed, kicker: e.target.value })} />
          <Field label="Title" value={feed.title} onChange={(e) => set("feed", { ...feed, title: e.target.value })} />
        </div>
        <ListEditor
          items={feed.items}
          onChange={(items) => set("feed", { ...feed, items })}
          max={8}
          itemLabel={(it) => it.label}
          render={(it, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Caption" value={it.label} onChange={(e) => update({ label: e.target.value })} />
              <div className="sm:col-span-2">
                <LinkPicker label="Tile goes to" value={it} onChange={update} />
              </div>
              <p className="m-0 text-xs text-ink-3 sm:col-span-2">Video file: /photos/{it.id}.mp4. New reels are added with the shop's photography.</p>
            </div>
          )}
        />
      </Panel>

      <Panel title="Newsletter box">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Small heading" value={newsletter.kicker} onChange={(e) => set("newsletter", { ...newsletter, kicker: e.target.value })} />
          <Field label="Title" value={newsletter.title} onChange={(e) => set("newsletter", { ...newsletter, title: e.target.value })} />
          <Field label="Text" className="sm:col-span-2" value={newsletter.text} onChange={(e) => set("newsletter", { ...newsletter, text: e.target.value })} />
          <Field label="Button" value={newsletter.cta} onChange={(e) => set("newsletter", { ...newsletter, cta: e.target.value })} />
          <Field label="Email placeholder" value={newsletter.placeholder} onChange={(e) => set("newsletter", { ...newsletter, placeholder: e.target.value })} />
        </div>
      </Panel>
    </>
  );
}
