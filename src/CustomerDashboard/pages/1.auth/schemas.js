/* Customer Auth Schemas */
import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email").email("Enter a valid email");
const password = z.string().min(8, "At least 8 characters");

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password"), remember: z.boolean().optional() });

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email,
  phone: z.string().trim().optional(),
  password,
  // A hidden field only bots fill in (gap A4).
  website: z.string().optional(),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match", path: ["confirm"] });
