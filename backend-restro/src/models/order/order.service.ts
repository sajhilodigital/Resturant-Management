import { Order } from "./order.model.js";
import { deductStock } from "../product/product.service.js";
import { Table } from "../table/table.model.js";

export const createOrder = async (data: any) => {
  const table = await Table.findById(data.tableId);
  if (!table || table.status !== "free") throw new Error("Table not available");
  table.status = "occupied";
  await table.save();

  for (const item of data.items)
    await deductStock(item.productId, item.quantity);

  return new Order(data).save();
};

export const updateOrderStatus = async (id: string, status: string) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  order.status = status;
  if (status === "completed") {
    const table = await Table.findById(order.tableId);
    if (table) {
      table.status = "free";
      await table.save();
    }
  }
  await order.save();
  return order;
};

export const getOrders = async () =>
  Order.find().populate("items.productId").populate("tableId");
