// src/config/roles.ts

// ────────────────────────────────────────────────
// 1. Roles as const object (literal types – best practice)
// ────────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin", // Owner / Super Admin (full control)
  MANAGER: "manager", // Branch manager / Supervisor
  WAITER: "waiter", // Front-of-house staff
  KITCHEN: "kitchen", // Kitchen staff / Chef
  CASHIER: "cashier", // Checkout / Billing staff
} as const;

// ────────────────────────────────────────────────
// 2. Types for maximum type safety
// ────────────────────────────────────────────────
export type RoleKey = keyof typeof ROLES;
export type RoleValue = (typeof ROLES)[RoleKey];

// ────────────────────────────────────────────────
// 3. Permissions as const (literal types – very granular)
// ────────────────────────────────────────────────
export const PERMISSIONS = {
  // User / Staff Management
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_VIEW: "user:view",
  USER_DELETE: "user:delete",
  USER_ROLE_CHANGE: "user:role:change", // special sensitive permission

  // Menu Management
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_VIEW: "category:view",
  CATEGORY_DELETE: "category:delete",

  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_VIEW: "product:view",
  PRODUCT_DELETE: "product:delete",
  PRODUCT_AVAILABILITY: "product:availability", // toggle in/out of stock

  // Table / Floor Management
  TABLE_ASSIGN: "table:assign",
  TABLE_MANAGE: "table:manage", // create/edit tables, floor plan
  TABLE_VIEW: "table:view",
  TABLE_STATUS: "table:status:update",

  // Order Management
  ORDER_CREATE: "order:create",
  ORDER_VIEW: "order:view",
  ORDER_UPDATE: "order:update", // add/remove items
  ORDER_CANCEL: "order:cancel",
  ORDER_STATUS: "order:status:update",

  // Kitchen Operations
  KITCHEN_VIEW: "kitchen:view",
  KITCHEN_UPDATE: "kitchen:update", // prepare/ready status

  // Billing & Invoicing
  BILL_GENERATE: "bill:generate",
  BILL_VIEW: "bill:view",
  BILL_VOID: "bill:void",
  BILL_SPLIT: "bill:split",

  // Payments
  PAYMENT_PROCESS: "payment:process",
  PAYMENT_VIEW: "payment:view",
  PAYMENT_REFUND: "payment:refund",

  // Reports & Analytics
  REPORT_VIEW: "report:view",
  REPORT_SALES: "report:sales",
  REPORT_INVENTORY: "report:inventory",
  REPORT_STAFF: "report:staff",

  // Settings & Advanced
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[Permission];

// ────────────────────────────────────────────────
// 4. Role → Permissions mapping (realistic & secure)
// ────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<RoleValue, PermissionValue[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // full system control

  [ROLES.MANAGER]: [
    // Staff & Users
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE, // can hire staff
    PERMISSIONS.USER_UPDATE,

    // Menu
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_AVAILABILITY,

    // Orders & Tables
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.TABLE_MANAGE,
    PERMISSIONS.TABLE_VIEW,
    PERMISSIONS.TABLE_STATUS,

    // Billing & Payments
    PERMISSIONS.BILL_GENERATE,
    PERMISSIONS.BILL_VIEW,
    PERMISSIONS.BILL_SPLIT,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_VIEW,

    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_SALES,
    PERMISSIONS.REPORT_INVENTORY,
    PERMISSIONS.REPORT_STAFF,
  ],

  [ROLES.WAITER]: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_CANCEL, // usually allowed to cancel own orders
    PERMISSIONS.TABLE_ASSIGN,
    PERMISSIONS.TABLE_VIEW,
    PERMISSIONS.TABLE_STATUS,
    PERMISSIONS.PRODUCT_VIEW, // to see menu
  ],

  [ROLES.KITCHEN]: [
    PERMISSIONS.KITCHEN_VIEW,
    PERMISSIONS.KITCHEN_UPDATE, // main kitchen permission: update status
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_STATUS,
    PERMISSIONS.PRODUCT_VIEW, // see item details / allergens
  ],

  [ROLES.CASHIER]: [
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.BILL_GENERATE,
    PERMISSIONS.BILL_VIEW,
    PERMISSIONS.BILL_SPLIT,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND, // partial refund allowed
    PERMISSIONS.PRODUCT_VIEW,
  ],
};

// ────────────────────────────────────────────────
// 5. Optional: Helper to get all permissions for a role (type-safe)
// ────────────────────────────────────────────────
export function getPermissionsForRole(role: RoleValue): PermissionValue[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
