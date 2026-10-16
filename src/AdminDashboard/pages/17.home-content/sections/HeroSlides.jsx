/* Hero Slides */
import Field from "@/components/ui/Field";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Toggle from "@/AdminDashboard/components/Toggle";

/**
 * The rotating slides at the top of the home page, in order. Keep the copy
 * short: it sits over the picture. A slide without an upload keeps the
 * brand's own photo for its id.
 */
export default function HeroSlides({ slides, onChange }) {
  return (
    <ListEditor
      items={slides}
      onChange={onChange}
      max={6}
      addLabel="Add a slide"
      newItem={() => ({ id: `slide-${Date.now().toString(36)}`, kicker: "", title: "", text: "", cta: "Shop now", href: "/shop", sticker: "", live: false, image: null })}
      itemLabel={(s, i) => `Slide ${i + 1}${s.title ? `: ${s.title}` : ""}`}
      render={(s, update) => (
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <ImageUploader single label="Picture" value={s.photo ? [s.photo] : []} onChange={(photos) => update({ image: photos[0] ?? null, photo: photos[0] })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle className="sm:col-span-2" checked={s.live !== false} onChange={(live) => update({ live })} label="Showing" />
            <Field label="Small heading" className="sm:col-span-2" value={s.kicker} onChange={(e) => update({ kicker: e.target.value })} placeholder="Gym · Pilates · Tennis" />
            <Field label="Title" value={s.title} onChange={(e) => update({ title: e.target.value })} />
            <Field label="Round tag (optional)" value={s.sticker ?? ""} onChange={(e) => update({ sticker: e.target.value })} placeholder="Sale" />
            <Field label="Text" className="sm:col-span-2" value={s.text} onChange={(e) => update({ text: e.target.value })} />
            <Field label="Button" value={s.cta} onChange={(e) => update({ cta: e.target.value })} />
            <Field label="Button goes to" value={s.href} onChange={(e) => update({ href: e.target.value })} hint="/shop, /shop?c=Swim, /product/…" />
          </div>
        </div>
      )}
    />
  );
}
