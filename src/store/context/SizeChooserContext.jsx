/* Size Chooser Context */
import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState } from "react";

import { useCart } from "@/store/context/CartContext";
import { notify } from "@/store/tanstackStore/notices";
import { anyInStock } from "@/utils/stockLevel";

const SizeChooser = lazy(() => import("@/components/storefront/SizeChooser"));
const SizeChooserContext = createContext(null);

/**
 * One size dialog for the whole shop, so a grid of cards doesn't mount one
 * each. `choose(pieces, { title })` drops sold-out pieces (and says so),
 * then asks for a size per piece; only then does anything enter the bag.
 */
export function SizeChooserProvider({ children }) {
  const { add } = useCart();
  const [open, setOpen] = useState(null);

  const choose = useCallback((pieces, { title } = {}) => {
    const sellable = pieces.filter((pc) => anyInStock(pc.product));
    const gone = pieces.filter((pc) => !anyInStock(pc.product));
    if (gone.length) notify(`${gone[0].product.name} is sold out, so it's left out.`);
    if (sellable.length) setOpen({ pieces: sellable, title });
  }, []);

  const onAdd = (lines) => {
    lines.forEach((l) => add(l));
    const one = lines.length === 1 ? open.pieces[0].product : null;
    notify(one ? `${one.name} (${lines[0].color}, ${lines[0].size}) is in your bag` : `${lines.length} pieces are in your bag`, { tone: "success" });
    setOpen(null);
  };

  const value = useMemo(() => ({ choose }), [choose]);
  return (
    <SizeChooserContext.Provider value={value}>
      {children}
      {open && (
        <Suspense fallback={null}>
          <SizeChooser pieces={open.pieces} title={open.title} onAdd={onAdd} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </SizeChooserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSizeChooser() {
  const ctx = useContext(SizeChooserContext);
  if (!ctx) throw new Error("useSizeChooser must be used inside SizeChooserProvider");
  return ctx;
}
