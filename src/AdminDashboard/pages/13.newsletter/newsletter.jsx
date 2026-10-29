/* Admin Newsletter */
import Tabs from "@/AdminDashboard/components/Tabs";
import { useTab } from "@/AdminDashboard/lib/useTab";
import { useCampaigns, useOutbox, useSubscribers } from "@/store/tanstackStore/queries/admin";
import Campaigns from "./sections/Campaigns";
import Outbox from "./sections/Outbox";
import Subscribers from "./sections/Subscribers";
import Welcome from "./sections/Welcome";

/**
 * The newsletter: who is on the list (double opt-in, with the consent each
 * gave), the emails written and sent to them, the welcome email with its
 * code, and every email the shop has sent or queued. Each tab opens the same
 * way, with a line on what it is for and four figures, then the work. The
 * tabs carry a count where there is something to look at.
 */
export default function AdminNewsletter() {
  const { data: subs = [] } = useSubscribers();
  const { data: campaigns = [] } = useCampaigns();
  const { data: mail = [] } = useOutbox();
  const attention = mail.filter((m) => ["failed", "held"].includes(m.status)).length;

  const TABS = [
    { id: "subscribers", label: "Subscribers", count: subs.filter((s) => s.status === "subscribed").length },
    { id: "campaigns", label: "Campaigns", count: campaigns.length || undefined },
    { id: "welcome", label: "Welcome email" },
    { id: "outbox", label: "Outbox", count: attention || undefined },
  ];
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
