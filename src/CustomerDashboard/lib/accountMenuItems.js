/* Account Menu */
import { Heart, MapPin, Package, Settings, UserRound } from "lucide-react";

// Order matches the numbered page folders: 2.profile … 6.settings
// (1.auth is the sign-in door, outside the menu).
export const ACCOUNT_MENU = [
  { to: "/account", label: "Profile", icon: UserRound, end: true },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/wishlist", label: "Saved pieces", icon: Heart },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/settings", label: "Settings", icon: Settings },
];
