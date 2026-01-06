// src/models/user/user.model.ts (or a separate types file)

// Import from your roles config
import { PermissionValue, RoleValue } from "config/permissions";
import { IProduct } from "modules/product/product.model";
import { Document, Types } from "mongoose";

// 1. User interface (full DB document shape)
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string; // hashed, select: false in schema
  phone?: string;
  avatar?: string; // Cloudinary / S3 URL
  role: RoleValue; // "admin" | "manager" | "waiter" | "kitchen"
  permissions: PermissionValue[]; // type-safe permissions array
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  otp?: string;
  otpExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
  };
}

export interface ICreateUserInput {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: RoleValue; // Must be "admin" | "manager" | "waiter" | "kitchen"
  phone?: string;
  restaurantId?: string; // optional multi-tenant
}

// Safe returned user type (Promise<CreatedUser>)
export interface CreatedUser {
  _id: string;
  name: string;
  email: string;
  role: RoleValue;
  permissions: PermissionValue[]; // Now correctly typed as permission literals
  isVerified: boolean;
  isActive: boolean;
}

// 4. Input for updating user (partial)
export interface IUpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: RoleValue;
  permissions: PermissionValue[];
  phone?: string;
  isActive?: boolean;
}

// 5. Login input (minimal)
export interface ILoginUserInput {
  email: string;
  password: string;
}

// Get all users (admin only)
export interface GetUsersOptions {
  excludeUserId?: string; // ID of currently logged-in user (from JWT/auth middleware)
}

export interface CurrentUser {
  id: string;
  role: string;
}

export interface PermissionOperationResult {
  user: Record<string, any>; // better to define proper type later
  message: string;
  action: "added" | "no-op";
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  isAvailable?: string; // 'true'/'false' from query
}

export interface PaginatedProducts {
  products: IProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}


export interface IUserPayload {
  id: string;
  branchId: string;
  role: "admin" | "manager" | "staff";
}