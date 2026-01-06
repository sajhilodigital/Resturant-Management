// src/modules/payments/controllers/payment.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import { AppError } from "utils/appError";
import { createPaymentService } from "./payment.service";

export const createPaymentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const payment = await createPaymentService(req.body, req.user.id);
    res.status(201).json({ success: true, data: payment });
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
