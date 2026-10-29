/* Account Profile */
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import RecentlyViewed from "@/components/storefront/RecentlyViewed";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useMyOrders, useProfile } from "@/store/tanstackStore/queries/account";

export default function AccountProfile() {
  const { customer } = useCustomerAuth();
  // Show the session's copy while the full profile loads, so the card never flashes empty.
  const { data: profile = customer } = useProfile(customer.id);
  const { data: orders } = useMyOrders(customer.id);

  // Where each count leads, so the strip doubles as a shortcut row.
  const stats = [
    { label: "Orders", value: orders?.length ?? 0, to: "/account/orders" },
    { label: "Saved pieces", value: profile.wishlist?.length ?? 0, to: "/account/wishlist" },
    { label: "Addresses", value: profile.addresses?.length ?? 0, to: "/account/addresses" },
  ];
  const rows = [
    ["Name", profile.name],
    ["Email", profile.email],
    ["Phone", profile.phone || "Not added"],
  ];

  return (
    <div className="grid gap-6">
      {/* Counts: one panel split by hairlines, each a link to its page */}
      <div className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-[22px] border border-line bg-white shadow-sh-1">
        {stats.map((s) => (
          <Link key={s.to} to={s.to} className="group relative px-4 py-5 transition-colors hover:bg-sand-50 sm:px-6">
            <p className="m-0 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-bold leading-none tracking-tight">{s.value}</p>
            <p className="m-0 mt-2 text-[.82rem] text-ink-3">{s.label}</p>
            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Details: label left, value right, split by hairlines instead of boxes */}
      <section className="rounded-[22px] border border-line bg-white p-5 shadow-sh-1 sm:p-8" aria-label="Your details">
        <h2 className="text-[1.15rem]">Your details</h2>
        <dl className="m-0 mt-2 divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[140px_1fr] sm:gap-4">
              <dt className="text-[.85rem] text-ink-3">{k}</dt>
              <dd className="m-0 break-words text-[.97rem] font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RecentlyViewed kicker="On this account" bare />
    </div>
  );
}
