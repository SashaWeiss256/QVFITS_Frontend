/* Admin Constants */
import {
  BadgePercent,
  Boxes,
  FolderTree,
  Home,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  MessagesSquare,
  Package,
  ReceiptText,
  Settings,
  Shirt,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react";

/**
 * Sidebar order, in groups. Top-level folders under pages/ are numbered in
 * this order, one past the sidebar position because 1.auth comes first; the
 * modules inside a group are not numbered (3.catalog/products). A group with
 * no label renders as a plain link.
 */
export const ADMIN_NAV = [
  { id: "overview", items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, end: true }] },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { to: "/admin/products", label: "Products", icon: Shirt },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
      { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { to: "/admin/orders", label: "Orders", icon: Package },
      { to: "/admin/customers", label: "Customers", icon: UserRound },
      { to: "/admin/discounts", label: "Discount codes", icon: BadgePercent },
      { to: "/admin/transactions", label: "Transactions", icon: ReceiptText, roles: ["owner"] },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { to: "/admin/offers", label: "Offers", icon: Tags },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { to: "/admin/website", label: "Home content", icon: Home },
      { to: "/admin/faq", label: "FAQ", icon: MessagesSquare },
    ],
  },
  { id: "team", items: [{ to: "/admin/team", label: "Team", icon: UsersRound, roles: ["owner"] }] },
  { id: "settings", items: [{ to: "/admin/settings", label: "Settings", icon: Settings }] },
];
