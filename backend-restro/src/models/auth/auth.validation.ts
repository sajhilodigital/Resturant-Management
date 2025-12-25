import { z } from "zod";

// OTP verification schema
export const otpSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  otp: z
    .string("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  otp: z
    .string("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),

  password: z
    .string("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    ),
});
