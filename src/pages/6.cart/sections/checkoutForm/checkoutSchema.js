/* Checkout Schema */
import { z } from "zod";

export const PAYMENTS = [
  { id: "mtn", label: "MTN Mobile Money" },
  { id: "airtel", label: "Airtel Money" },
  { id: "card", label: "Visa or Mastercard" },
  { id: "whatsapp", label: "Confirm and pay with the team on WhatsApp" },
];

// Ugandan numbers: 07XX XXX XXX or +256 7XX XXX XXX, spaces allowed.
const phone = z
  .string()
  .trim()
  .min(1, "We need a number to reach you")
  .refine((v) => /^(\+?256|0)7\d{8}$/.test(v.replace(/[\s-]/g, "")), "Enter a Ugandan mobile number, e.g. 0758 981 959");

export const deliverySchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    phone,
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
    region: z.enum(["kampala", "upcountry", "pickup"]),
    address: z.string().trim().optional(),
    note: z.string().trim().max(300).optional(),
    payment: z.enum(["mtn", "airtel", "card", "whatsapp"]),
  })
  .refine((v) => v.region === "pickup" || (v.address ?? "").length > 3, { message: "Where should we deliver it?", path: ["address"] });
