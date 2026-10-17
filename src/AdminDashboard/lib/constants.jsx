/* Admin Constants */
import {
  Activity,
  BadgePercent,
  BarChart3,
  FileText,
  FolderTree,
  Globe,
  Inbox,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  Package,
  Ruler,
  Settings,
  ShieldCheck,
  Shirt,
  Tags,
  UsersRound,
} from "lucide-react";

/**
 * The sidebar, in groups. Every page has its own link, so nothing hides
 * behind a tab, and a group disappears when the role can see none of it.
 * The page folders follow this order.
 */
export const ADMIN_NAV = [
  {
    id: "main",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, perm: "overview", end: true },
      { to: "/admin/reports", label: "Reports", icon: BarChart3, perm: "reports" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", icon: Shirt, perm: "products" },
      { to: "/admin/categories", label: "Categories", icon: FolderTree, perm: "categories" },
      { to: "/admin/size-guide", label: "Sizes and size guide", icon: Ruler, perm: "size-guide" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: Package, perm: "orders" },
      { to: "/admin/customers", label: "Customers", icon: UsersRound, perm: "customers" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { to: "/admin/discounts", label: "Discount codes", icon: BadgePercent, perm: "discounts" },
      { to: "/admin/offers", label: "Offers and banners", icon: Tags, perm: "offers" },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail, perm: "newsletter" },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { to: "/admin/website", label: "Home page", icon: Globe, perm: "home-content" },
      { to: "/admin/pages", label: "Pages and menus", icon: FileText, perm: "pages" },
      { to: "/admin/faq", label: "FAQ", icon: MessagesSquare, perm: "faq" },
      { to: "/admin/messages", label: "Messages", icon: Inbox, perm: "messages" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { to: "/admin/team", label: "Team and roles", icon: ShieldCheck, perm: "team" },
      { to: "/admin/settings", label: "Settings", icon: Settings, perm: "settings" },
      { to: "/admin/activity", label: "Activity log", icon: Activity, perm: "activity" },
    ],
  },
];

/** The first page a person may open, for after sign-in and the no-access panel. */
export function firstAllowed(can) {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (can(item.perm)) return item.to;
    }
  }
  return "/admin";
}
