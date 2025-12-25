import { Router } from "express";
import { PERMISSIONS } from "../../config/permissions.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/role.middleware.js";
import * as c from "./user.controller.js";

const router = Router();

// router.use(authenticate);

router.post(
  "/create-user",
  authenticate,
  requirePermission(PERMISSIONS.USER_CREATE),
  c.createUserController
);

router.get(
  "/list-user",
  authenticate,
  requirePermission(PERMISSIONS.USER_VIEW),
  c.getUsersController
);
router.put(
  "/update-user/:id",
  authenticate,
  requirePermission(PERMISSIONS.USER_UPDATE),
  c.updateUserController
);
router.delete(
  "delete-user/:id",
  authenticate,
  requirePermission(PERMISSIONS.USER_UPDATE),
  c.deleteUserController
);

export { router as userRoutes };
