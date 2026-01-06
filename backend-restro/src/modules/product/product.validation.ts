// src/modules/menu/products/validators/product.validator.ts
import { z } from "zod";
import mongoose from "mongoose";

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  basePrice: z.number().nonnegative("Price cannot be negative"),
  categoryId: z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, "Invalid category ID"),
  image: z.string().url().optional().or(z.literal("")),
  preparationTime: z.number().int().min(0).optional(),
  allergens: z.array(z.string()).optional(),
  isPopular: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),

  // Variants & Addons (optional but powerful)
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().nonnegative(),
        sku: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .optional(),

  addons: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().nonnegative(),
        maxQuantity: z.number().int().min(1).optional(),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParam = z.object({
  id: z.string().refine(mongoose.Types.ObjectId.isValid, "Invalid product ID"),
});
