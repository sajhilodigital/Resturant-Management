// src/modules/tables/validators/table.validator.ts
import { z } from "zod";

export const createTableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required").trim(),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  location: z.string().trim().optional(),
});

export const updateTableSchema = z.object({
  tableNumber: z.string().min(1).trim().optional(),
  capacity: z.number().int().min(1).optional(),
  status: z
    .enum(["free", "occupied", "reserved", "dirty", "maintenance"])
    .optional(),
  location: z.string().trim().optional(),
});
