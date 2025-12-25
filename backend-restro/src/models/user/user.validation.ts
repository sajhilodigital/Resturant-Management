import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .nonempty("Email cannot be empty")
    .email({ message: "Please enter a valid email address" })
    .max(255, "Email is too long"),

  password: z
    .string("Password is required")
    .nonempty("Password cannot be empty")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
});
