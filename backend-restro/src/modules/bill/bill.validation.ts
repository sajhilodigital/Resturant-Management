

// src/modules/bills/validators/bill.validator.ts
import { z } from 'zod';

export const generateBillSchema = z.object({
  orderId: z.string(),
  tax: z.number().min(0).optional(),
  serviceCharge: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
});