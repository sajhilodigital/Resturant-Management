import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./user.service.js";
import { successResponse } from "../../utils/response.js";

// Create User
export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await service.createUser(req.body);
    console.log(user);
    successResponse(res, user, "User created", 201);
  }
);

// Get User
export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await service.getUsers();
    successResponse(res, users);
  }
);
// Update User
export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await service.updateUser(req.params.id, req.body);
    successResponse(res, user, "User updated");
  }
);
// User Delete
export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.deleteUser(req.params.id);
    successResponse(res, null, "User deleted");
  }
);
