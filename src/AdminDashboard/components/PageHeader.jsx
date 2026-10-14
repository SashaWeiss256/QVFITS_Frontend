/* Admin Page Header */

// Every admin module opens with its one h1, a line on what it is for, and
// its main action on the right.
export default function PageHeader({ title, lede, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2.1rem)]">{title}</h1>
        {lede && <p className="m-0 mt-1 text-ink-3">{lede}</p>}
      </div>
      {action}
    </div>
  );
}
