/* Permission Matrix */
import { cn } from "@/utils/cn";

const ACTIONS = [["view", "See"], ["edit", "Change"], ["delete", "Delete"]];

/**
 * One row per admin module, a tick per action. Changing or deleting needs
 * seeing, so ticking either ticks See, and unticking See clears the row.
 * `base` marks what the role gives, for a person's overrides.
 */
export default function PermissionMatrix({ modules, value, onChange, base, disabled = false }) {
  const toggle = (mod, action) => {
    const had = value[mod] ?? [];
    let next = had.includes(action) ? had.filter((a) => a !== action) : [...had, action];
    if (action !== "view" && next.includes(action) && !next.includes("view")) next = ["view", ...next];
    if (action === "view" && !next.includes("view")) next = [];
    onChange({ ...value, [mod]: next });
  };

  return (
    <div className="overflow-x-auto rounded-r-md border border-line bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="eyebrow px-3 py-2 text-left">Module</th>
            {ACTIONS.map(([, l]) => <th key={l} scope="col" className="eyebrow px-3 py-2 text-center">{l}</th>)}
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => {
            const changed = base && JSON.stringify([...(value[m.id] ?? [])].sort()) !== JSON.stringify([...(base[m.id] ?? [])].sort());
            return (
              <tr key={m.id} className={cn("border-b border-line last:border-0", changed && "bg-brand-50")}>
                <th scope="row" className="px-3 py-2 text-left font-normal">{m.label}{changed && <span className="ml-2 text-xs text-brand-600">changed for this person</span>}</th>
                {ACTIONS.map(([a, l]) => (
                  <td key={a} className="px-3 py-2 text-center">
                    {m.actions.includes(a) && (
                      <input type="checkbox" disabled={disabled} aria-label={`${l} ${m.label}`} checked={(value[m.id] ?? []).includes(a)} onChange={() => toggle(m.id, a)} />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
