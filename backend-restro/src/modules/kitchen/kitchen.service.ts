// src/modules/kitchen/services/kitchen.service.ts

import { OrderTable } from "modules/order/order.model";

export const getPendingOrdersService = async (branchId: string) => {
  return await OrderTable.find({
    branchId,
    status: { $in: ["pending", "preparing"] },
    isActive: true,
  });
};
