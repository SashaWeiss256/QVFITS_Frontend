/* Account Addresses */
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useProfile } from "@/store/tanstackStore/queries/account";

// The add / edit form ports next (useSaveAddresses).
export default function AccountAddresses() {
  const { customer } = useCustomerAuth();
  // Fall back to the session's copy while the full profile loads.
  const { data: profile = customer } = useProfile(customer.id);

  return (
    <div className="rounded-[22px] border border-line bg-white p-6 shadow-sh-1 sm:p-8">
      <h2 className="text-[1.3rem]">Delivery addresses</h2>
      {/* Address List */}
      {profile.addresses.length ? (
        <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
          {profile.addresses.map((a) => (
            <li key={a.id} className="rounded-[16px] border border-line-2 p-4">
              <strong className="font-display">{a.label}</strong>
              <p className="m-0 mt-1 text-sm text-ink-2">{a.address}</p>
              <p className="m-0 text-sm text-ink-3">{a.phone}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-ink-3">No saved addresses. Add one at checkout and it will appear here.</p>
      )}
    </div>
  );
}
