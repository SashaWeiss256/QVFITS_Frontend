/* Vee Questions */
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCollection, veeQuestionsResource } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import Panel from "@/AdminDashboard/components/Panel";

/**
 * Everything shoppers asked Vee, newest first, with the ones she could not
 * answer picked out by the "Answer" filter. Only the words are kept: no name,
 * no contact. The newest 200 stay.
 */
export default function VeeQuestions() {
  const questions = useCollection(veeQuestionsResource);
  const { can } = useAdminAuth();
  const rows = questions.items;
  const missed = rows.filter((q) => !q.answered).length;

  const columns = [
    { key: "text", label: "Question", sort: (q) => q.text, render: (q) => q.text },
    { key: "answered", label: "Answer", sort: (q) => (q.answered ? 1 : 0), render: (q) => <StatusChip status={q.answered ? "active" : "pending"} label={q.answered ? "Answered" : "Not answered"} /> },
    { key: "createdAt", label: "Asked", sort: (q) => q.createdAt, render: (q) => formatDateTime(q.createdAt) },
  ];

  return (
    <Panel title={missed ? `${missed} not answered` : "Questions"} hint={`${rows.length} asked`}>
      <DataTable
        rows={rows}
        loading={questions.isLoading}
        columns={columns}
        search={(q) => q.text}
        searchLabel="Search questions"
        filters={[{ id: "answered", label: "Answer", options: [{ value: "no", label: "Not answered" }, { value: "yes", label: "Answered" }], test: (q, v) => q.answered === (v === "yes") }]}
        initialSort={{ key: "createdAt", dir: "desc" }}
        rowActions={can("vee", "delete") ? (q) => [{ label: "Delete", danger: true, onClick: () => questions.remove(q.id) }] : undefined}
        empty="Nobody has asked Vee anything yet."
      />
    </Panel>
  );
}
