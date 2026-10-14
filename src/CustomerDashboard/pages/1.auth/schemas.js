/* Customer Auth Schemas */
import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email").email("Enter a valid email");
const password = z.string().min(6, "At least 6 characters");

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email,
  phone: z.string().trim().optional(),
  password,
});

export const forgotSchema = z.object({ email });
