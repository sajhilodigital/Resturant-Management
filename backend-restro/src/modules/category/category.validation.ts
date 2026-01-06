import { z } from "zod";
import mongoose from "mongoose";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdParam = z.object({
  id: z.string().refine(mongoose.Types.ObjectId.isValid, {
    message: "Invalid MongoDB ObjectId",
  }),
});

export const toggleCategoryStatusSchema = z.object({
  isActive: z.boolean("isActive must be boolean"),
});
