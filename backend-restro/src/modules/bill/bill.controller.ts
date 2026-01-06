// src/modules/bills/controllers/bill.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import { generateBillService } from "./bill.service";
import { AppError } from "utils/appError";

export const generateBillController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const bill = await generateBillService(
      req.body,
      req.user.id,
      req.user.branchId
    );
    res.status(201).json({ success: true, data: bill });
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
