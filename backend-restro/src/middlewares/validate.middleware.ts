import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";

export const validateReqBody =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: (error as Error).message });
    }
  };

  /**
 * Middleware to validate MongoDB ObjectId in route params
 */
export const validateMongoId =
  (paramName: string = "id") =>
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid MongoDB ObjectId in parameter "${paramName}"`,
      });
    }

    next();
  };