/* Wishlist Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { saveWishlist } from "@/store/tanstackStore/services/customers/customersApi";
import { readStored, writeStored } from "@/utils/storage";
import { useCustomerAuth } from "./CustomerAuthContext";

const WishlistContext = createContext(null);
const KEY = "qvfits:wishlist";

/**
 * Saved pieces (product ids). A guest's list lives on this device; once a
 * shopper signs in, the device list and the account list are merged and the
 * account keeps it from then on.
 */
export function WishlistProvider({ children }) {
  const { customer } = useCustomerAuth();
  const [ids, setIds] = useState(() => readStored(KEY, []));

  // Merge the account's saved pieces in when a shopper signs in.
  const accountIds = customer?.wishlist;
  useEffect(() => {
    if (!accountIds?.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one merge per sign-in, from the account record
    setIds((current) => [...new Set([...current, ...accountIds])]);
  }, [accountIds]);

  useEffect(() => {
    writeStored(KEY, ids);
    if (customer) saveWishlist(customer.id, ids).catch(() => {});
  }, [ids, customer]);

  const toggle = useCallback(
    (id) => setIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id])),
    [],
  );

  const value = useMemo(() => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle }), [ids, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
