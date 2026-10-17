/* Admin Categories */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import Colours from "./sections/Colours";
import FilterAndSort from "./sections/FilterAndSort";
import MegaMenu from "./sections/MegaMenu";
import ShopBy from "./sections/ShopBy";

const TABS = [
  { id: "groups", label: "Shop by" },
  { id: "colours", label: "Colours" },
  { id: "menu", label: "Menu" },
  { id: "filters", label: "Filter and sort" },
];

/**
 * How the shop is browsed, as belioras' Categories & Colours: the "Shop by"
 * groups (Category, Movement, Edits, and any added since) with their items,
 * which build the Shop menu, the filter drawer and every /shop address;
 * the colours products come in; the Shop menu and top bar; and the shop's
 * Filter and Sort controls.
 */
export default function AdminCategories() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "groups" && <ShopBy />}
      {tab === "colours" && <Colours />}
      {tab === "menu" && <MegaMenu />}
      {tab === "filters" && <FilterAndSort />}
    </>
  );
}
