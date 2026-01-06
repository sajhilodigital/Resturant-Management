// src/modules/payments/validators/payment.validator.ts
import { z } from "zod";

export const createPaymentSchema = z.object({
  billId: z.string(),
  amount: z.number().min(0),
  method: z.enum(["cash", "card", "upi", "wallet", "online"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});
