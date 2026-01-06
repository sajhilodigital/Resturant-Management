// src/modules/order/routes/order.routes.ts

import { Router } from "express";
import { authenticate } from "middlewares/auth.middleware";
import { createOrderController, deleteOrderController, getOrderByIdController, getOrdersController, updateOrderStatusController } from "./order.controller";
import { PERMISSIONS } from "config/permissions";
import { requireAnyPermission } from "middlewares/role.middleware";

const router = Router();

router.post(
  "/order/create-order",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_CREATE),
  createOrderController
);


router.get(
  "/order/order-list",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_VIEW),
  getOrdersController
);


router.get(
  "/order/order-detail/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_VIEW),
  getOrderByIdController
);



router.patch(
  "/order/add-remove-items/:id/items",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_UPDATE),
  updateOrderItemsController
);


router.patch(
  "/order/:id/status",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_STATUS),
  updateOrderStatusController
);

/**
 * @route   PATCH /api/order/:id/cancel
 * @desc    Cancel an order (with reason)
 * @access  Waiter (own orders), Manager, Admin
 */
router.patch(
  "order/:id/cancel",
  authenticate,
  requireAnyPermission(PERMISSIONS.ORDER_CANCEL),
  cancelOrderController
);


router.delete(
  "/order/delete-order/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_DELETE), // Reuse or create ORDER_DELETE if preferred
  // Alternative: create dedicated ORDER_DELETE permission
  deleteOrderController
);

export { router as orderRoutes };
