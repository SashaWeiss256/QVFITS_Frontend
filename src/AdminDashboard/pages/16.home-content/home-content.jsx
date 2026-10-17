/* Admin Home Page */
import { ExternalLink } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { contentResource, movementsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import HeroSlides from "./sections/HeroSlides";
import HomeSections from "./sections/HomeSections";

// The view carries resolved photos for previews; only the stored fields are saved.
const stripPhoto = ({ photo: _photo, ...rest }) => rest;
function toStored(doc) {
  return {
    heroSlides: doc.heroSlides.map(stripPhoto),
    movements: { ...doc.movements, items: doc.movements.items.map(stripPhoto) },
    campaign: stripPhoto(doc.campaign),
    press: doc.press,
    feed: doc.feed,
    newsletter: doc.newsletter,
  };
}

/**
 * Every section of the home page, top to bottom as shoppers see it. The two
 * product rails are picked under Catalog, Rails and kits.
 */
export default function AdminHomeContent() {
  const doc = useDocument(contentResource);
  const movements = useCollection(movementsResource);
  if (!doc.data) return <PageLoader />;
  return <Editor doc={doc} movements={movements.items} />;
}

function Editor({ doc, movements }) {
  const { can } = useAdminAuth();
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);

  return (
    <>
      <PageHeader
        lede="Slides, tiles, the campaign and the sign-up box. Saved changes go live at once."
        action={<a className="btn btn--ghost" href="/" target="_blank" rel="noopener noreferrer">Open the home page <ExternalLink className="h-4 w-4" /></a>}
      />
      <fieldset disabled={!can("home-content", "edit")} className="m-0 grid gap-6 border-0 p-0">
        <Panel title="Hero slides">
          <HeroSlides slides={draft.heroSlides} onChange={(slides) => set("heroSlides", slides)} />
        </Panel>
        <HomeSections draft={draft} set={set} movements={movements} />
      </fieldset>
      <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit(await doc.save(toStored(draft)))} />
    </>
  );
}
