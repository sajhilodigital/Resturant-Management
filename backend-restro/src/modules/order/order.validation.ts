// src/modules/orders/validators/order.validator.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  tableId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
        addons: z.array(z.string()).optional(),
        variant: z.string().optional(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "served", "cancelled"]),
  servedBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});
