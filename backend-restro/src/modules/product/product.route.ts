// src/modules/menu/products/routes/product.routes.ts
import { PERMISSIONS } from "config/permissions";
import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware";
import { requireAnyPermission } from "middlewares/role.middleware";
import {
  createProductController,
  deleteProductController,
  getProductDetailController,
  listProductsPaginatedController,
  toggleProductAvailabilityController,
  updateProductController,
} from "./product.controller";

const router = Router();

// ─────────────────────────────────────────────────────────────
// Product Collection Routes
// ─────────────────────────────────────────────────────────────
router.post(
  "/products/create-product",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_CREATE),
  createProductController
);

//GET /api/products/list-product
// Page 3, 20 items
// GET /api/products/list-product?page=3&limit=20
// Sort by price low to high
// GET /api/products/list-product?page=1&limit=15&sortBy=basePrice&sortOrder=asc
// Only available products in category
// GET /api/products/list-product?categoryId=507f1f77bcf86cd799439011&isAvailable=true

router.get(
  "/products/list-product",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_VIEW),
  listProductsPaginatedController
);

// ─────────────────────────────────────────────────────────────
// Single Product Operations
// ─────────────────────────────────────────────────────────────
router.put(
  "/products/update-product/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_UPDATE),
  updateProductController
);

router.delete(
  "/products/delete-product/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_DELETE),
  deleteProductController
);

// ─────────────────────────────────────────────────────────────
// Quick Availability Toggle (very common in restaurants)
// ─────────────────────────────────────────────────────────────
router.put(
  "/products/product-availability/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_UPDATE),
  toggleProductAvailabilityController
);


router.get(
  "/products/product-detail/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.PRODUCT_VIEW),
  getProductDetailController
);

export { router as productRoutes };
