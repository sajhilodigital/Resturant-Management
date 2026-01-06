// src/modules/tables/routes/table.routes.ts
import { PERMISSIONS } from "config/permissions";
import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware";
import { requireAnyPermission } from "middlewares/role.middleware";
import {
  createTableController,
  getTablesController,
  updateTableController
} from "./table.controller";

const router = Router();

router.post(
  "/table/create-table",
  authenticate,
  requireAnyPermission(PERMISSIONS.TABLE_MANAGE),
  createTableController
);

router.get(
  "/table/list-table",
  authenticate,
  requireAnyPermission(PERMISSIONS.TABLE_VIEW),
  getTablesController
);

router.put(
  "/table/update-table/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.TABLE_MANAGE),
  updateTableController
);

export { router as tableRoutes };
