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

  // On sign-out every admin query is dropped, so a different person signing in never sees the last person's data.
  const forget = useCallback(() => queryClient.removeQueries({ queryKey: realmRoot("admin") }), [queryClient]);

  // Reads the current session once, then listens for the token being cleared (the idle sign-out, for one) to sign out here too.
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

  // The one-time owner registration signs the new owner straight in.
  const setupOwner = useCallback(async (input) => {
    const a = await auth.setupOwner(input);
    setAdmin(a);
    return a;
  }, []);

  // Setting a password from an invite signs the person straight in.
  const acceptInvite = useCallback(async (input) => {
    const a = await auth.acceptInvite(input);
    setAdmin(a);
    return a;
  }, []);

  // Re-reads the session, so a change to your own role applies at once.
  const refresh = useCallback(async () => setAdmin(await auth.currentAdmin()), []);

  // What the signed-in admin may do: can("products", "edit"). The server
  // checks again; this only decides what to show.
  const can = useCallback((module, action = "view") => Boolean(admin?.permissions?.[module]?.includes(action)), [admin]);

  const value = useMemo(
    () => ({ admin, loading, signIn, signOut, setupOwner, acceptInvite, refresh, can }),
    [admin, loading, signIn, signOut, setupOwner, acceptInvite, refresh, can],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
}
