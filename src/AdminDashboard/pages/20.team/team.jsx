/* Admin Team And Roles */
import { useState } from "react";

import { rolesResource, staffResource, useCollection, usePermissionModules } from "@/store/tanstackStore/queries/admin";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Tabs from "@/AdminDashboard/components/Tabs";
import People from "./sections/People";
import Roles from "./sections/Roles";

/**
 * Who can sign in, and what each of them can see, change and delete. The
 * shop always keeps at least one active owner.
 */
export default function AdminTeam() {
  const [tab, setTab] = useState("people");
  const roles = useCollection(rolesResource);
  const staff = useCollection(staffResource);
  const { data: modules = [] } = usePermissionModules();

  return (
    <>
      <PageHeader lede="Invite staff, give them a role, and fine-tune access per person." />
      <Tabs tabs={[{ id: "people", label: "People", count: staff.items.length }, { id: "roles", label: "Roles", count: roles.items.length }]} value={tab} onChange={setTab} />
      <Panel>
        {tab === "people" ? <People roles={roles.items} modules={modules} /> : <Roles roles={roles.items} modules={modules} staff={staff.items} />}
      </Panel>
    </>
  );
}
