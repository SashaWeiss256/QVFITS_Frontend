/* Admin Vee */
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import PairingRules from "./sections/PairingRules";
import VeeQuestions from "./sections/VeeQuestions";
import VeeSettings from "./sections/VeeSettings";

const TABS = [
  { id: "settings", label: "Settings" },
  { id: "pairing", label: "Pairing rules" },
  { id: "questions", label: "Questions" },
];
const LEDES = {
  settings: "Vee is the style assistant in the corner of the shop. Switch her on or off, name her and set how she opens.",
  pairing: "How Vee matches colours when she builds an outfit. Test any two colours, and overrule her with your own always and never pairs.",
  questions: "What shoppers asked her. The ones she couldn't answer are first: each is a gap in the range, a missing piece of information, or a word she should know.",
};

/** Vee's own page: how she looks to shoppers, and what she was asked. */
export default function AdminVee() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <PageHeader lede={LEDES[tab]} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "settings" ? <VeeSettings /> : tab === "pairing" ? <PairingRules /> : <VeeQuestions />}
    </>
  );
}
