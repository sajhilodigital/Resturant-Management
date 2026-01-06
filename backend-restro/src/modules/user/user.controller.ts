import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./user.service.js";
import { successResponse } from "../../utils/response.js";
import { AuthRequest } from "middlewares/auth.middleware.js";
import {
  addPermissionSchema,
  permissionParamsSchema,
  removePermissionSchema,
} from "./user.validation.js";
import { AppError } from "utils/appError.js";

// Create User
export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = await service.createUser(req.body);
      console.log(user);
      successResponse(res, user, "User created", 201);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to Create user",
      });
    }
  }
);

// Get User
export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const users = await service.getUsers();
      successResponse(res, users);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed To Get User list",
      });
    }
  }
);

// Update User
export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      try {
        const user = await service.updateUser(req.params.id, req.body);
        successResponse(res, user, "User updated");
      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message || "Failed to Update user",
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
);
// User Delete
export const deleteUserController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userIdToDelete = req.params.id;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      await service.deleteUser(userIdToDelete, currentUserId);
      successResponse(res, null, "User deleted successfully");
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
);

export const addUserPermission = async (req: Request, res: Response) => {
  try {
    const { userId } = permissionParamsSchema.parse(req.params);
    const { permission } = addPermissionSchema.parse(req.body);

    const result = await service.addUserPermissionService(
      userId,
      permission,
      req.user! 
    );

    return res.status(200).json({
      success: true,
      message: result.message, // ← use message from service (more flexible)
      action: result.action,
      data: result.user,
    });
  } catch (error) {
    // Known application errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        // code: error.code, // optional - if you add error codes
      });
    }

    // Unexpected errors - should be logged in production (sentry, winston, etc.)
    console.error("[addUserPermission] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add permission - please try again later",
    });
  }
};

export const removeUserPermission = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { permission } = req.body;

    console.log({ userId, permission });

    const updatedUser = await service.removeUserPermissionService(
      userId,
      permission,
      req.user!
    );

    res.status(200).json({
      success: true,
      message: `Permission "${permission}" removed successfully`,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
