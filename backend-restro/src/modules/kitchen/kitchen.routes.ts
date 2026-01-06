// src/modules/kitchen/routes/kitchen.routes.ts
import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware.js";
import { requireAnyPermission } from "middlewares/role.middleware.js";
import { getPendingOrdersController } from "./kitchen.controller.js";
import { PERMISSIONS } from "config/permissions.js";

const router = Router();

router.get(
  "/pending-orders",
  authenticate,
  requireAnyPermission(PERMISSIONS.KITCHEN_VIEW),
  getPendingOrdersController
);

export { router as kitchenRoutes };
