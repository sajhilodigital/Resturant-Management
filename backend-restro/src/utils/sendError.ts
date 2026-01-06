import { Response } from "express";
import { AppError } from "./appError";

// Helper to send standardized error responses
export const sendErrorResponse = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Log unexpected errors in production (you can integrate Winston/Morgan later)
  console.error("Unexpected error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
