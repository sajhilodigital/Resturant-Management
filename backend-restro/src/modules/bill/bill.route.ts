// src/modules/bills/routes/bill.routes.ts
import { PERMISSIONS } from "config/permissions";
import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware";
import { requireAnyPermission } from "middlewares/role.middleware";
import { generateBillController } from "./bill.controller";

const router = Router();

router.post(
  "/generate-bill",
  authenticate,
  requireAnyPermission(PERMISSIONS.BILL_GENERATE),
  generateBillController
);

export { router as billRoutes };
