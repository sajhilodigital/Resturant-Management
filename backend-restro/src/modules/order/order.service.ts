// src/modules/order/services/order.service.ts
import { Types } from "mongoose";
import { ZodError } from "zod";
import { IOrder } from "./order.interface";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation";
import { TableTable } from "modules/table/table.model";
import { AppError } from "utils/appError";
import { ProductTable } from "modules/product/product.model";
import { OrderTable } from "./order.model";

export const createOrderService = async (
  data: unknown,
  createdBy: string
): Promise<IOrder> => {
  try {
    const validated = createOrderSchema.parse(data);

    const table = await TableTable.findOne({
      _id: new Types.ObjectId(validated.tableId),
      isActive: true,
    });
    if (!table) {
      throw new AppError("Invalid or inactive table", 404);
    }

    let totalAmount = 0;
    const items = [];
    for (const item of validated.items) {
      const menu = await ProductTable.findOne({
        _id: new Types.ObjectId(item.productId),
        isActive: true,
      });
      if (!menu) {
        throw new AppError(`Menu item ${item.productId} not found`, 404);
      }
      const subtotal = menu.basePrice * item.quantity;
      totalAmount += subtotal;
      items.push({
        menuItemId: menu._id,
        name: menu.name,
        price: menu.basePrice,
        quantity: item.quantity,
        notes: item.notes,
      });
    }

    const order = new OrderTable({
      tableId: table._id,
      items,
      totalAmount,
      createdBy: new Types.ObjectId(createdBy),
    });

    await order.save();
    return order.toObject() as IOrder;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to create order", 500);
  }
};

export const getOrderByIdService = async (
  orderId: string
): Promise<IOrder | null> => {
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid order ID", 400);
    }
    const order = await OrderTable.findOne({
      _id: new Types.ObjectId(orderId)
    })
      .populate("tableId", "tableNumber location")
      .populate("items.productId", "name")
      .populate("createdBy", "name role");
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order.toObject() as IOrder;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to fetch order", 500);
  }
};

export const getOrdersService = async (query: unknown): Promise<IOrder[]> => {
  try {
    const validatedQuery = getOrdersQuerySchema.parse(query);
    if (validatedQuery.status) filter.status = validatedQuery.status;
    if (validatedQuery.tableId)
      filter.tableId = new Types.ObjectId(validatedQuery.tableId);
    if (validatedQuery.startDate && validatedQuery.endDate) {
      filter.createdAt = {
        $gte: new Date(validatedQuery.startDate),
        $lte: new Date(validatedQuery.endDate),
      };
    }

    const orders = await OrderTable.find(filter)
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 })
      .lean();
    return orders as IOrder[];
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to list orders", 500);
  }
};

export const updateOrderStatusService = async (
  orderId: string,
  data: unknown
): Promise<IOrder> => {
  try {
    const validated = updateOrderStatusSchema.parse(data);
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid order ID", 400);
    }
    const order = await OrderTable.findOne({
      _id: new Types.ObjectId(orderId),
    });
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    order.status = validated.status;
    if (validated.status === "completed") {
      order.completedAt = new Date();
    }
    await order.save();
    return order.toObject() as IOrder;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to update order status", 500);
  }
};

export const deleteOrderService = async (orderId: string): Promise<void> => {
  try {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid order ID", 400);
    }
    const order = await OrderTable.findOne({
      _id: new Types.ObjectId(orderId)
    });
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    if (order.status !== "pending" && order.status !== "cancelled") {
      throw new AppError("Can only delete pending or cancelled orders", 403);
    }
    await OrderTable.deleteOne({ _id: order._id });
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to delete order", 500);
  }
};
