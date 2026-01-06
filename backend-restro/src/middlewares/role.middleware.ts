// src/middlewares/permission.middleware.ts

import type { NextFunction, Response } from "express";
import {
  PermissionValue,
  ROLE_PERMISSIONS,
  RoleValue,
} from "../config/permissions.js";
import { AuthRequest } from "./auth.middleware.js"; // Your auth middleware that adds req.user

// Middleware: Require ALL of the listed permissions (AND logic)
// export const requirePermission = (
//   ...requiredPermissions: PermissionValue[]
// ) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     // 1. Check if user is authenticated
//     if (!req.user || !req.user.role) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - authentication required",
//       });
//     }

//     const userRole = req.user.role.toLowerCase() as RoleValue;

//     console.log(userRole);

//     // 1️⃣ Check role exists
//     if (!Object.values(ROLES).includes(userRole as RoleValue)) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden - invalid user role",
//       });
//     }

//     // 3. Get user's permissions
//     const userPermissions = ROLE_PERMISSIONS[userRole] as PermissionValue[];

//     // 2️⃣ ADMIN = full access (shortcut)
//     if (userRole === ROLES.ADMIN) {
//       return next();
//     }

//     // 5. Check if user has ALL required permissions
//     const hasAll = requiredPermissions.every((perm) =>
//       userPermissions.includes(perm)
//     );

//     if (hasAll) {
//       return next();
//     }

//     // 6. Forbidden with details
//     return res.status(403).json({
//       success: false,
//       message: "Forbidden - insufficient permissions",
//       required: requiredPermissions,
//       userHas: userPermissions,
//     });
//   };
// };

// Middleware: Require ANY of the listed permissions (OR logic)
export const requireAnyPermission = (
  ...requiredPermissions: PermissionValue[]
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - authentication required",
      });
    }

    let userRole = req.user.role.toLowerCase() as RoleValue;

    if (!(userRole in ROLE_PERMISSIONS)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - invalid user role",
      });
    }

    const userPermissions = ROLE_PERMISSIONS[userRole] as PermissionValue[];

    if (userRole === "admin") {
      return next();
    }

    const hasAny = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (hasAny) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden - missing required permission",
      requiredAnyOf: requiredPermissions,
      userHas: userPermissions,
    });
  };
};
