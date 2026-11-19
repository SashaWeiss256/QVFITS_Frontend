/* Hero Slides */
import Field from "@/components/ui/Field";
import { photoSources } from "@/utils/media";
import ImageUploader from "@/AdminDashboard/components/ImageUploader";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ListEditor from "@/AdminDashboard/components/ListEditor";
import Panel from "@/AdminDashboard/components/Panel";
import Toggle from "@/AdminDashboard/components/Toggle";

const newSlide = () => ({ id: `hero-${Date.now().toString(36)}`, title: "", text: "", cta: "Shop now", live: false, target: {}, focus: 50, triptych: false });

/**
 * The pictures that fill the first screen, in the order they turn. Each has
 * a picture (landscape works best), a headline, one line under it and a
 * button that goes wherever it is pointed. A new slide starts hidden, so it
 * only shows once it has a picture and words.
 */
export default function HeroSlides({ slides, onChange }) {
  return (
    <Panel title="Hero slides" hint="The first screen of the home page. Slides turn in this order.">
      <ListEditor
        items={slides}
        onChange={onChange}
        max={5}
        addLabel="Add a slide"
        newItem={newSlide}
        itemLabel={(s, i) => `Slide ${i + 1}${s.live ? "" : ", hidden"}`}
        render={(s, update) => (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="grid content-start gap-4">
              {/* A new picture is one landscape photograph, never the shoot's three-portrait layout */}
              <ImageUploader
                single
                folder="content"
                maxWidth={2000}
                shape="landscape"
                label="Picture"
                value={s.photo ? [s.photo] : []}
                onChange={(photos) => update({ image: photos[0] ?? null, photo: photos[0], triptych: false })}
              />
              {s.photo && !s.triptych && <Focus slide={s} update={update} />}
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Toggle className="sm:col-span-2" checked={s.live} onChange={(live) => update({ live })} label="Showing on the shop" hint="Off keeps the slide here but takes it off the home page." />
              <Field className="sm:col-span-2" label="Headline" value={s.title} maxLength={60} placeholder="Fit that holds." onChange={(e) => update({ title: e.target.value })} />
              <Field className="sm:col-span-2" as="textarea" rows={2} label="Line under it" value={s.text} maxLength={140} hint="One short sentence." onChange={(e) => update({ text: e.target.value })} />
              <Field label="Button" value={s.cta} maxLength={24} placeholder="Shop now" onChange={(e) => update({ cta: e.target.value })} />
              <div className="sm:col-span-2">
                <LinkPicker label="Button goes to" value={s} onChange={update} />
              </div>
            </div>
          </div>
        )}
      />
    </Panel>
  );
}

/**
 * On a phone the wide picture is cut to a tall strip. This says where the
 * person stands, so the strip keeps her in view; the frame shows the cut.
 */
function Focus({ slide, update }) {
  const at = slide.focus ?? 75;
  const src = photoSources(slide.photo, { wide: true });
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
      <span className="relative block aspect-[9/16] overflow-hidden rounded-[8px] border border-line bg-beige" aria-hidden="true">
        <img className="absolute inset-0 h-full w-full object-cover" src={src.src} alt="" style={{ objectPosition: `${at}% 50%` }} />
      </span>
      <label className="grid gap-1.5 text-sm">
        <span className="font-semibold text-ink-2">On a phone</span>
        <input type="range" min={0} max={100} step={1} value={at} onChange={(e) => update({ focus: Number(e.target.value) })} className="w-full accent-brand-500" aria-describedby={`${slide.id}-focus`} />
        <span id={`${slide.id}-focus`} className="text-xs text-ink-4">Slide until the person is in the frame.</span>
      </label>
    </div>
  );
}
