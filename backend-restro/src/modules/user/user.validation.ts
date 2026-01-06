import {
  PERMISSIONS,
  ROLES,
  RoleValue
} from "config/permissions";
import { z } from "zod";

export const createUserByAdminSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),

  email: z
    .string()
    .email("Please provide a valid email address")
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  role: z
    .array(z.enum(Object.values(ROLES) as [RoleValue, ...RoleValue[]]))
    .optional()
    .default([]),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
});


const validPermissions = Object.values(PERMISSIONS) as [string, ...string[]];

export const permissionParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const addPermissionSchema = z.object({
  permission: z.enum(validPermissions),
});

export const removePermissionSchema = z.object({
  permission: z.enum(validPermissions),
});