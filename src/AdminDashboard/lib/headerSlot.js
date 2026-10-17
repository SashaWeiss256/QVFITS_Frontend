/* Admin Header Slot */
import { createContext } from "react";

/**
 * The place in the admin header where a page puts its main action
 * (Add product, New order). AdminLayout provides the element; PageHeader
 * renders the action into it.
 */
export const HeaderSlotContext = createContext(null);
