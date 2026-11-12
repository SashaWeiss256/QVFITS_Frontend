/* Cart Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { saveBag } from "@/store/tanstackStore/services/customers/customersApi";
import { readStored, writeStored } from "@/utils/storage";
import { useCustomerAuth } from "./CustomerAuthContext";

const CartContext = createContext(null);
const KEY = "qvfits:cart";
const MAX_QTY = 10;

// A piece added from a kit stays its own line, so the kit price can still apply to the set.
const same = (a, b) => a.productId === b.productId && a.size === b.size && a.color === b.color && (a.kitId ?? null) === (b.kitId ?? null);

/**
 * The bag: lines of { productId, size, color, qty }, kept on this device so
 * a guest never loses it. Prices are never stored here; checkout prices the
 * lines on the server side (checkoutApi), in UGX. Signed in, the bag also
 * follows the account to other devices (gap F6).
 */
export function CartProvider({ children }) {
  const { customer } = useCustomerAuth();
  const [lines, setLines] = useState(() => readStored(KEY, []));
  // The one side drawer the header opens: "cart" | "wish" | "menu" | null.
  const [drawer, setDrawer] = useState(null);

  // At sign-in the account's bag joins this device's. The larger quantity
  // wins for a line in both, so merging twice never doubles anything.
  const accountBag = customer?.bag;
  useEffect(() => {
    if (!accountBag?.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one merge per sign-in, from the account record
    setLines((current) => {
      const merged = current.map((l) => {
        const other = accountBag.find((a) => same(a, l));
        return other ? { ...l, qty: Math.min(MAX_QTY, Math.max(l.qty, other.qty)) } : l;
      });
      return [...merged, ...accountBag.filter((a) => !current.some((l) => same(l, a)))];
    });
  }, [accountBag]);

  const customerId = customer?.id;
  useEffect(() => {
    writeStored(KEY, lines);
    if (customerId) saveBag(customerId, lines).catch(() => {});
  }, [lines, customerId]);

  const add = useCallback((line) => {
    setLines((current) => {
      const existing = current.find((l) => same(l, line));
      if (!existing) return [...current, { ...line, qty: line.qty ?? 1 }];
      return current.map((l) => (same(l, line) ? { ...l, qty: Math.min(MAX_QTY, l.qty + (line.qty ?? 1)) } : l));
    });
    setDrawer("cart");
  }, []);

  const setQty = useCallback((line, qty) => {
    setLines((current) =>
      qty < 1 ? current.filter((l) => !same(l, line)) : current.map((l) => (same(l, line) ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);

  const remove = useCallback((line) => setLines((current) => current.filter((l) => !same(l, line))), []);
  const clear = useCallback(() => setLines([]), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      add,
      setQty,
      remove,
      clear,
      drawer,
      openDrawer: setDrawer,
      closeDrawer,
    }),
    [lines, add, setQty, remove, clear, drawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
