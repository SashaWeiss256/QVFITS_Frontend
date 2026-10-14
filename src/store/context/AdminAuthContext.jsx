/* Admin Auth Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { onTokenChange } from "@/store/tanstackStore/services/api/tokens";
import * as auth from "@/store/tanstackStore/services/auth/adminAuthApi";
import { realmRoot } from "@/store/tanstackStore/queries/keys";

const AdminAuthContext = createContext(null);

/**
 * The staff session (realm: admin). Kept apart from the shopper's so the two
 * never share a token, a cache entry or a sign-out. No admin rows linger in
 * memory once an admin signs out.
 */
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const forget = useCallback(() => queryClient.removeQueries({ queryKey: realmRoot("admin") }), [queryClient]);

  useEffect(() => {
    let alive = true;
    auth.currentAdmin()
      .then((a) => alive && setAdmin(a))
      .finally(() => alive && setLoading(false));

    const off = onTokenChange((realm, token) => {
      if (realm !== "admin" || token) return;
      setAdmin(null);
      forget();
    });
    return () => {
      alive = false;
      off();
    };
  }, [forget]);

  const signIn = useCallback(async (credentials) => {
    const a = await auth.login(credentials);
    setAdmin(a);
    return a;
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout();
    forget();
  }, [forget]);

  const value = useMemo(
    () => ({ admin, loading, signIn, signOut, acceptInvite: auth.acceptInvite }),
    [admin, loading, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}
