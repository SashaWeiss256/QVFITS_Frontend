/* Empty State */

// Quivogue's empty drawer and empty shop message: an icon in brand tint, a
// line of copy, and the one action that helps.
export default function EmptyState({ icon: Icon, children, action }) {
  return (
    <div className="px-6 py-16 text-center text-ink-3">
      {Icon && <Icon className="mx-auto mb-4 h-6 w-6 text-brand-400" aria-hidden="true" />}
      <p className="m-0">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
