/* Admin Newsletter */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import Campaigns from "./sections/Campaigns";
import Outbox from "./sections/Outbox";
import Subscribers from "./sections/Subscribers";
import Welcome from "./sections/Welcome";

const TABS = [
  { id: "subscribers", label: "Subscribers" },
  { id: "campaigns", label: "Campaigns" },
  { id: "welcome", label: "Welcome email" },
  { id: "outbox", label: "Outbox" },
];

/**
 * The newsletter, as on belioras: who is on the list (double opt-in, with
 * the consent each gave), the emails written and sent to them, the welcome
 * email with its code, and every email the shop has queued while no email
 * service is connected.
 */
export default function AdminNewsletter() {
  const [tab, setTab] = useTab(TABS);
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "subscribers" && <Subscribers />}
      {tab === "campaigns" && <Campaigns />}
      {tab === "welcome" && <Welcome />}
      {tab === "outbox" && <Outbox />}
    </>
  );
}
