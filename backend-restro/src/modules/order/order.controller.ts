// src/modules/order/controllers/order.controller.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "middlewares/auth.middleware";
import { createOrderService, deleteOrderService, getOrderByIdService, getOrdersService, updateOrderStatusService } from "./order.service";
import { AppError } from "utils/appError";

export const createOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user?.id) {
      throw new AppError("Unauthorized: Missing user data", 401);
    }
    const order = await createOrderService(req.body, user.id);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const order = await getOrderByIdService(req.params.id);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const orders = await getOrdersService( req.query);
    res.status(200).json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await updateOrderStatusService(
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    await deleteOrderService(req.params.id);
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    next(error);
  }
};
