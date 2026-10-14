/* Application Providers */
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";

import NetworkStatus from "@/components/ui/NetworkStatus";
import { AdminAuthProvider } from "@/store/context/AdminAuthContext";
import { CartProvider } from "@/store/context/CartContext";
import { CurrencyProvider } from "@/store/context/CurrencyContext";
import { CustomerAuthProvider } from "@/store/context/CustomerAuthContext";
import { WishlistProvider } from "@/store/context/WishlistContext";
import { persistOptions } from "@/store/tanstackStore/persist";
import { queryClient } from "@/store/tanstackStore/queryClient";

// Two auth providers, never one: the shopper's and the admin's sessions are
// separate realms and never share state (docs/02-folder-structure.md).
export default function AppProviders({ children }) {
  return (
    // Storefront (["site", …]) queries are restored from storage; see persist.ts
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {/* Motion honours the visitor's reduced-motion setting everywhere */}
      <MotionConfig reducedMotion="user">
        <AdminAuthProvider>
          <CustomerAuthProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>{children}</CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </CustomerAuthProvider>
        </AdminAuthProvider>
      </MotionConfig>
      <NetworkStatus />
      {/* Dev only; bottom-left so it never covers Vee */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </PersistQueryClientProvider>
  );
}
