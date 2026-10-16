/* Confirm Dialog */
import Button from "./Button";
import Modal from "./Modal";

// For destructive actions. While `loading`, the dialog can't be dismissed so the
// request can't be abandoned halfway.
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Are you sure?", itemName, confirmLabel = "Delete", loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" dismissable={!loading}>
      <p className="text-ink-2">
        Remove <strong>{itemName || "this item"}</strong>? This cannot be undone.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button variant="danger" block onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        <Button variant="ghost" block onClick={onClose} disabled={loading}>Cancel</Button>
      </div>
    </Modal>
  );
}
