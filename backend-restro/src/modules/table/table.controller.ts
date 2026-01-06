// src/modules/tables/controllers/table.controller.ts

import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import { sendErrorResponse } from "utils/sendError";
import { createTableService, getAllTablesService, updateTableService } from "./table.service";

export const createTableController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found in request",
      });
    }

    if (!user.id) {
      return res.status(400).json({
        success: false,
        message: "User ID or Branch ID is missing",
      });
    }

    const table = await createTableService(req.body, user.id);

    return res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    return sendErrorResponse(error, res);
  }
};

export const updateTableController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const table = await updateTableService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    return sendErrorResponse(error, res);
  }
};

export const getTablesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tables = await getAllTablesService(); 

    return res.status(200).json({
      success: true,
      data: tables,
      count: tables.length,
    });
  } catch (error) {
    next(error);
  }
};
