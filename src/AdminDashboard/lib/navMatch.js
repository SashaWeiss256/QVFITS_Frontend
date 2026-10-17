/* Admin Nav Match */
import { ADMIN_NAV } from "./constants";

const hit = (pathname, item) => (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`));

/** The sidebar item a path belongs to, with its group, for the sidebar and header. */
export function activeNavItem(pathname) {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((i) => hit(pathname, i));
    if (item) return { ...item, group: group.label };
  }
  return null;
}
