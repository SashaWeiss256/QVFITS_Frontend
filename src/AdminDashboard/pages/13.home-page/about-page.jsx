/* Admin About Page */
import { Info } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { homeResource, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import AboutPictures from "./sections/AboutPictures";

/**
 * The About page's pictures, managed like the home page's: upload or
 * replace each one, or go back to the shoot's photo. They are kept in the
 * same content document as the home page, so they share its save, its
 * permission (Offers) and its "not on the server yet" state.
 */
export default function AdminAboutPage() {
  const doc = useDocument(homeResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const canEdit = can("offers", "edit");
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  const ready = doc.data.onServer;

  return (
    <>
      <PageHeader lede="The pictures on the About page: the opening picture, the three in the story and the showroom. Replace any of them, then save." />
      {!ready && (
        <p className="m-0 mb-6 flex items-start gap-3 rounded-[14px] border border-line bg-sand-50 px-4 py-3 text-sm leading-relaxed text-ink-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
          <span>This is what the About page shows today. Saving switches on once the server keeps the page content, so changes made now can be looked at but not saved yet.</span>
        </p>
      )}
      <fieldset disabled={!canEdit} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        <AboutPictures about={draft.about} onChange={(v) => set("about", v)} />
      </fieldset>
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} disabled={!ready} onReset={reset} onSave={async () => commit(await doc.save({ about: draft.about }))} />}
    </>
  );
}
