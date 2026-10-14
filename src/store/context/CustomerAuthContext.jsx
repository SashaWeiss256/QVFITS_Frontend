/* Customer Auth Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { onTokenChange } from "@/store/tanstackStore/services/api/tokens";
import * as auth from "@/store/tanstackStore/services/auth/customerAuthApi";
import { realmRoot } from "@/store/tanstackStore/queries/keys";

const CustomerAuthContext = createContext(null);

/**
 * The shopper's session (realm: customer). Separate from the admin's on
 * purpose: each has its own token, storage key and provider, so signing out
 * of one never touches the other. Restored on boot and dropped the moment the
 * token is cleared anywhere (a 401, a sign-out in another view).
 */
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Nothing of a signed-out shopper stays in the cache.
  const forget = useCallback(() => queryClient.removeQueries({ queryKey: realmRoot("customer") }), [queryClient]);

  useEffect(() => {
    let alive = true;
    auth.currentCustomer()
      .then((c) => alive && setCustomer(c))
      .finally(() => alive && setLoading(false));

    const off = onTokenChange((realm, token) => {
      if (realm !== "customer" || token) return;
      setCustomer(null);
      forget();
    });
    return () => {
      alive = false;
      off();
    };
  }, [forget]);

  const signIn = useCallback(async (credentials) => {
    const c = await auth.login(credentials);
    setCustomer(c);
    return c;
  }, []);

  const signUp = useCallback(async (details) => {
    const c = await auth.signup(details);
    setCustomer(c);
    return c;
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout();
    forget();
  }, [forget]);

  const value = useMemo(
    () => ({ customer, loading, signIn, signUp, signOut, requestPasswordReset: auth.requestPasswordReset }),
    [customer, loading, signIn, signUp, signOut],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  return context;
}
