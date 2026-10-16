/* Save Bar */
import Button from "@/components/ui/Button";

// Sticks to the bottom of a long settings form once something has changed,
// so Save is always in reach and nobody leaves with unsaved edits.
export default function SaveBar({ dirty, saving, onSave, onReset, label = "Save changes", disabled = false }) {
  if (!dirty) return null;
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <span className="mr-auto text-sm text-ink-3">You have unsaved changes</span>
      <Button variant="ghost" onClick={onReset} disabled={saving}>Discard</Button>
      <Button onClick={onSave} loading={saving} disabled={disabled}>{label}</Button>
    </div>
  );
}
