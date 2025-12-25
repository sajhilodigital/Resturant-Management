// src/config/env.ts
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000), // Converts string to number
  MONGO_URI: z.string(),
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  OTP_EXPIRY: z.coerce.number().default(300), // Converts string → number
  // Add more variables as needed
});

// Parse and export
export const ENV = envSchema.parse(process.env);

// Optional: Log for debugging (remove in production)
console.log("Environment loaded:", {
  PORT: ENV.PORT,
  OTP_EXPIRY: ENV.OTP_EXPIRY,
});
