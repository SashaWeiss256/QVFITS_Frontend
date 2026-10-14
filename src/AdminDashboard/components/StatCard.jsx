/* Stat Card */

export default function StatCard({ label, value, note }) {
  return (
    <div className="rounded-r-lg bg-white p-5 shadow-sh-1">
      <p className="eyebrow m-0">{label}</p>
      <p className="m-0 mt-2 font-display text-[1.7rem] font-bold">{value}</p>
      {note && <p className="m-0 mt-1 text-sm text-ink-3">{note}</p>}
    </div>
  );
}
