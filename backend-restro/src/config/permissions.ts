// src/config/roles.ts

// ────────────────────────────────────────────────
// 1. Roles as const object (literal types – best practice)
// ────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  WAITER: "waiter",
  KITCHEN: "kitchen",
  // Add more roles as needed, e.g., CASHIER: 'cashier'
} as const;

// ────────────────────────────────────────────────
// 2. Types for maximum type safety
// ────────────────────────────────────────────────
export type RoleKey = keyof typeof ROLES; // "ADMIN" | "MANAGER" | ...
export type RoleValue = (typeof ROLES)[RoleKey]; // "admin" | "manager" | ...

// ────────────────────────────────────────────────
// 3. Permissions as const (literal types)
// ────────────────────────────────────────────────
export const PERMISSIONS = {
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_VIEW: "user:view",
  USER_DELETE: "user:delete",

  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_VIEW: "product:view",
  PRODUCT_DELETE: "product:delete",

  ORDER_CREATE: "order:create",
  ORDER_UPDATE: "order:update",
  ORDER_VIEW: "order:view",
  ORDER_CANCEL: "order:cancel",

  BILL_GENERATE: "bill:generate",
  BILL_VIEW: "bill:view",

  PAYMENT_PROCESS: "payment:process",
  PAYMENT_VIEW: "payment:view",

  TABLE_ASSIGN: "table:assign",
  TABLE_MANAGE: "table:manage",
  TABLE_VIEW: "table:view",

  // Add more granular permissions as your system grows
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[Permission];

// ────────────────────────────────────────────────
// 4. Role → Permissions mapping (type-safe Record)
// ────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<RoleValue, PermissionValue[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Full access (wildcard)

  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.BILL_GENERATE,
    PERMISSIONS.BILL_VIEW,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.TABLE_MANAGE,
    PERMISSIONS.TABLE_VIEW,
  ],

  [ROLES.WAITER]: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.TABLE_ASSIGN,
    PERMISSIONS.TABLE_VIEW,
  ],

  [ROLES.KITCHEN]: [PERMISSIONS.ORDER_UPDATE, PERMISSIONS.ORDER_VIEW],
};
