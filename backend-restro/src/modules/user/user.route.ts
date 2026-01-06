import { Router } from "express";
import { PERMISSIONS } from "../../config/permissions.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../middlewares/role.middleware.js";
import * as c from "./user.controller.js";

const router = Router();

router.post(
  "/create-user",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_CREATE),
  c.createUserController
);

router.get(
  "/list-user",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_VIEW),
  c.getUsersController
);

router.put(
  "/update-user/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_UPDATE),
  c.updateUserController
);

router.delete(
  "/delete-user/:id",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_UPDATE),
  c.deleteUserController
);

router.put(
  "/update-permissions/:userId/add",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_UPDATE),
  c.addUserPermission
);

router.put(
  "/update-permissions/:userId/remove",
  authenticate,
  requireAnyPermission(PERMISSIONS.USER_UPDATE),
  c.removeUserPermission
);

export { router as userRoutes };
