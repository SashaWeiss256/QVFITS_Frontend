/* Admin Activity Log */
import { useActivity, usePermissionModules } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

const ACTIONS = [{ value: "create", label: "Added" }, { value: "update", label: "Changed" }, { value: "delete", label: "Deleted" }];

/** Who changed what, and when: every save in the admin, newest first. */
export default function AdminActivity() {
  const { data: rows = [], isLoading } = useActivity();
  const { data: modules = [] } = usePermissionModules();
  const people = [...new Set(rows.map((r) => r.actorName))];
  const moduleLabel = (id) => modules.find((m) => m.id === id)?.label ?? id;

  return (
    <>
      <PageHeader lede="Every change made in the admin, with who made it. The last 500 are kept." />
      <Panel>
        <DataTable
          rows={rows}
          loading={isLoading}
          columns={[
            { key: "at", label: "When", sort: (r) => r.at, render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.at)}</span> },
            { key: "actorName", label: "Who" },
            { key: "module", label: "Where", render: (r) => moduleLabel(r.module) },
            { key: "summary", label: "What" },
          ]}
          initialSort={{ key: "at", dir: "desc" }}
          search={(r) => `${r.summary} ${r.actorName}`}
          filters={[
            { id: "who", label: "Person", options: people.map((p) => ({ value: p, label: p })), test: (r, v) => r.actorName === v },
            { id: "module", label: "Module", options: modules.map((m) => ({ value: m.id, label: m.label })), test: (r, v) => r.module === v },
            { id: "action", label: "Action", options: ACTIONS, test: (r, v) => r.action === v },
          ]}
          exportName="activity"
          exportRow={(r) => ({ when: r.at, who: r.actorName, module: r.module, action: r.action, what: r.summary })}
          empty="Nothing yet. Changes made in the admin are listed here."
        />
      </Panel>
    </>
  );
}
