// src/modules/menu/categories/routes/category.routes.ts
import { PERMISSIONS } from "config/permissions";
import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware";
import { requireAnyPermission } from "middlewares/role.middleware";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, toggleCategoryStatusController, updateCategoryController } from "./category.controller";

const router = Router();


// ─────────────────────────────────────────────────────────────
// Category Collection Routes
// ─────────────────────────────────────────────────────────────
router.post(
  "/categories/create-category",
  authenticate,
  requireAnyPermission(PERMISSIONS.CATEGORY_CREATE),
  createCategoryController
);

router.get(
  "/categories/list-category",
  authenticate,
  requireAnyPermission(PERMISSIONS.CATEGORY_VIEW),
  getAllCategoriesController
);

router.put(
  "/categories/update-category/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.CATEGORY_UPDATE),
  updateCategoryController
);

router.delete(
  "/categories/delete-category/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.CATEGORY_DELETE),
  deleteCategoryController
);

router.put(
  "/categories/category-status/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.CATEGORY_UPDATE),
  toggleCategoryStatusController
);
export { router as categoryRoutes };
