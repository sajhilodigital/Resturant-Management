// src/modules/kitchen/controllers/kitchen.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import { getPendingOrdersService } from "./kitchen.service";
import { AppError } from "utils/appError";

export const getPendingOrdersController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await getPendingOrdersService(req.user.branchId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    if (error instanceof AppError)
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    else
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
  }
};
