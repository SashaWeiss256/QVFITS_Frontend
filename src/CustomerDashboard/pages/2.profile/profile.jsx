/* Account Profile */
import RecentlyViewed from "@/components/storefront/RecentlyViewed";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useProfile } from "@/store/tanstackStore/queries/account";

export default function AccountProfile() {
  const { customer } = useCustomerAuth();
  // Show the session's copy while the full profile loads, so the card never flashes empty.
  const { data: profile = customer } = useProfile(customer.id);

  return (
    <>
      <div className="rounded-r-lg bg-white p-6 shadow-sh-1">
        <h2 className="text-[1.3rem]">Profile</h2>
        <dl className="mt-4 grid gap-3 text-[.95rem] sm:grid-cols-[120px_1fr]">
          <dt className="text-ink-3">Name</dt><dd className="m-0">{profile.name}</dd>
          <dt className="text-ink-3">Email</dt><dd className="m-0">{profile.email}</dd>
          <dt className="text-ink-3">Phone</dt><dd className="m-0">{profile.phone || "Not added"}</dd>
        </dl>
      </div>
      <RecentlyViewed kicker="On this account" bare />
    </>
  );
}
