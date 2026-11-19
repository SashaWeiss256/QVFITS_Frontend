/* Admin Home Page */
import { Info } from "lucide-react";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { homeResource, useDocument } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import Tabs from "@/AdminDashboard/components/Tabs";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import { useTab } from "@/AdminDashboard/lib/useTab";
import HeroSlides from "./sections/HeroSlides";
import MovementTiles from "./sections/MovementTiles";
import SeenOnYou from "./sections/SeenOnYou";

/**
 * The three parts of the home page the shop changes most: the hero at the
 * top, the Shop by movement row and the Seen on you reels. Each picture can
 * be uploaded or replaced, the words changed, and every button pointed at a
 * part of the shop, a piece or a page. One tab each; nothing is live until
 * Save. Storefront content, so it shares the Offers permission.
 */
export default function AdminHomePage() {
  const doc = useDocument(homeResource);
  if (!doc.data) return <PageLoader variant="form" />;
  return <Editor doc={doc} />;
}

function Editor({ doc }) {
  const { can } = useAdminAuth();
  const canEdit = can("offers", "edit");
  const { draft, set, dirty, reset, commit } = useDraft(doc.data);
  // Until the API keeps the home page, the editor shows what the shop shows but cannot save it.
  const ready = doc.data.onServer;
  const tabs = [
    { id: "hero", label: "Hero", count: draft.heroSlides.filter((s) => s.live).length },
    { id: "movement", label: "Shop by movement", count: draft.movements.items.length },
    { id: "feed", label: "Seen on you", count: draft.feed.items.length },
  ];
  const [tab, setTab] = useTab(tabs);

  return (
    <>
      {/* Page Header */}
      <PageHeader lede="The top of the home page, the Shop by movement row and the Seen on you reels. Change a picture, the words or where a button goes, then save." />

      {/* Not saved on the server yet: say so plainly instead of letting a save fail */}
      {!ready && (
        <p className="m-0 mb-6 flex items-start gap-3 rounded-[14px] border border-line bg-sand-50 px-4 py-3 text-sm leading-relaxed text-ink-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
          <span>This is what the home page shows today. Saving switches on once the server is updated to keep the home page, so changes made now can be looked at but not saved yet.</span>
        </p>
      )}

      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <fieldset disabled={!canEdit} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        {tab === "hero" && <HeroSlides slides={draft.heroSlides} onChange={(v) => set("heroSlides", v)} />}
        {tab === "movement" && <MovementTiles movements={draft.movements} onChange={(v) => set("movements", v)} />}
        {tab === "feed" && <SeenOnYou feed={draft.feed} onChange={(v) => set("feed", v)} />}
      </fieldset>

      {/* Save Bar: appears once something changes */}
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} disabled={!ready} onReset={reset} onSave={async () => commit(await doc.save(draft))} />}
    </>
  );
}
