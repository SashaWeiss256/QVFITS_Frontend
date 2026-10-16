/* Checkout Schema */
import { z } from "zod";

// Ugandan numbers: 07XX XXX XXX or +256 7XX XXX XXX, spaces allowed.
const phone = z
  .string()
  .trim()
  .min(1, "We need a number to reach you")
  .refine((v) => /^(\+?256|0)7\d{8}$/.test(v.replace(/[\s-]/g, "")), "Enter a Ugandan mobile number, e.g. 0758 981 959");

// Zones and payment methods are the admin's, so the schema is built from
// them: only an offered zone or method passes, and a collection zone needs
// no address.
export const deliverySchema = (zones = [], methods = []) => z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    phone,
    // Optional: an empty field passes, anything typed must be a real email.
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
    region: z.string().refine((v) => zones.some((zone) => zone.id === v), "Pick where it is going"),
    // Required for delivery only; the refine below enforces it.
    address: z.string().trim().optional(),
    note: z.string().trim().max(300).optional(),
    payment: z.string().refine((v) => methods.some((m) => m.id === v), "Pick how you'd like to pay"),
  })
  .refine((v) => zones.find((zone) => zone.id === v.region)?.collect || (v.address ?? "").length > 3, { message: "Where should we deliver it?", path: ["address"] });
