/* Admin Constants - Simple, Intuitive Navigation */
import {
  Activity,
  BadgePercent,
  Boxes,
  FileText,
  FolderTree,
  Globe,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  MessagesSquare,
  Package,
  ReceiptText,
  Settings,
  Shirt,
  Tags,
  Undo2,
  UsersRound,
} from "lucide-react";

/**
 * Clean, simple, industry-standard 7-item navigation.
 * All complex sub-features are organized as intuitive sub-tabs inside their respective hub.
 */
export const ADMIN_NAV = [
  {
    id: "main",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, perm: "overview", end: true },
      { to: "/admin/products", label: "Products", icon: Shirt, perm: "products" },
      { to: "/admin/orders", label: "Orders", icon: Package, perm: "orders" },
      { to: "/admin/customers", label: "Customers", icon: UsersRound, perm: "customers" },
      { to: "/admin/discounts", label: "Promotions", icon: BadgePercent, perm: "discounts" },
      { to: "/admin/website", label: "Online Store", icon: Globe, perm: "home-content" },
      { to: "/admin/settings", label: "Settings", icon: Settings, perm: "settings" },
    ],
  },
];

/** Sub-tabs for the Catalog Hub (Products, Categories, Inventory, Reviews) */
export const CATALOG_TABS = [
  { to: "/admin/products", label: "All Products", icon: Shirt, end: true, perm: "products" },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, perm: "categories" },
  { to: "/admin/inventory", label: "Inventory Stock", icon: Boxes, perm: "inventory" },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, perm: "reviews" },
];

/** Sub-tabs for the Sales & Orders Hub (Orders, Returns, Transactions) */
export const ORDERS_TABS = [
  { to: "/admin/orders", label: "All Orders", icon: Package, end: true, perm: "orders" },
  { to: "/admin/returns", label: "Returns & Exchanges", icon: Undo2, perm: "returns" },
  { to: "/admin/transactions", label: "Transactions", icon: ReceiptText, perm: "transactions" },
];

/** Sub-tabs for the Customers Hub (Customers, Support Messages) */
export const CUSTOMERS_TABS = [
  { to: "/admin/customers", label: "Customer Directory", icon: UsersRound, end: true, perm: "customers" },
  { to: "/admin/messages", label: "Support Inbox", icon: Inbox, perm: "messages" },
];

/** Sub-tabs for Marketing & Promotions (Discounts, Offers/Banners, Subscribers) */
export const MARKETING_TABS = [
  { to: "/admin/discounts", label: "Discount Codes", icon: BadgePercent, end: true, perm: "discounts" },
  { to: "/admin/offers", label: "Offers & Banners", icon: Tags, perm: "offers" },
  { to: "/admin/newsletter", label: "Subscribers", icon: Mail, perm: "newsletter" },
];

/** Sub-tabs for Online Store CMS (Homepage, Pages & Navigation, FAQ) */
export const STORE_TABS = [
  { to: "/admin/website", label: "Home Page", icon: Globe, end: true, perm: "home-content" },
  { to: "/admin/pages", label: "Pages & Menus", icon: FileText, perm: "pages" },
  { to: "/admin/faq", label: "FAQ", icon: MessagesSquare, perm: "faq" },
];

/** Sub-tabs for Store Settings (Settings, Team, Activity Log) */
export const SETTINGS_TABS = [
  { to: "/admin/settings", label: "Store Settings", icon: Settings, end: true, perm: "settings" },
  { to: "/admin/team", label: "Team & Roles", icon: UsersRound, perm: "team" },
  { to: "/admin/activity", label: "Activity Log", icon: Activity, perm: "activity" },
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
