/* Formatting */

// Keep dates in the shop's Uganda locale instead of inheriting the visitor's browser locale.
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

// Date and time, for order timelines and the activity log.
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-UG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
