/* Admin Auth Schemas */
import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const inviteSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The passwords do not match", path: ["confirm"] });

// The first owner's account. The server allows 8 to 72 characters (bcrypt reads at most 72 bytes).
export const setupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name"),
    email: z.string().trim().min(1, "Enter your email").email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(72, "At most 72 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The passwords do not match", path: ["confirm"] });
