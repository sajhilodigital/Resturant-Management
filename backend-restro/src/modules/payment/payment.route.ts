// src/modules/payments/routes/payment.routes.ts
import { PERMISSIONS } from 'config/permissions';
import { Router } from 'express';
import { authenticate } from 'middlewares/auth.middleware';
import { requireAnyPermission } from 'middlewares/role.middleware';
import { createPaymentController } from './payment.controller';

const router = Router();

router.post(
  "/process-payment",
  authenticate,
  requireAnyPermission(PERMISSIONS.PAYMENT_PROCESS),
  createPaymentController
);

export { router as paymentRoutes };