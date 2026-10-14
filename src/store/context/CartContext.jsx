/* Cart Context */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { readStored, writeStored } from "@/utils/storage";

const CartContext = createContext(null);
const KEY = "qvfits:cart";
const MAX_QTY = 10;

const same = (a, b) => a.productId === b.productId && a.size === b.size && a.color === b.color;

/**
 * The bag: lines of { productId, size, color, qty }, kept on this device so
 * a guest never loses it. Prices are never stored here; checkout prices the
 * lines on the server side (checkoutApi), in UGX.
 */
export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => readStored(KEY, []));
  // The one side drawer the header opens: "cart" | "wish" | "menu" | null.
  const [drawer, setDrawer] = useState(null);

  useEffect(() => writeStored(KEY, lines), [lines]);

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
