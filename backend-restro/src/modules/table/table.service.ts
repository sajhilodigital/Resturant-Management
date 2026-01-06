// src/modules/tables/services/table.service.ts

import { Types } from "mongoose";
import { createTableSchema, updateTableSchema } from "./table.validation";
import { ITable, TableTable } from "./table.model";
import { AppError } from "utils/appError";
import { ZodError } from "zod";

export const createTableService = async (
  data: unknown,
  createdBy: string
): Promise<ITable> => {
  try {
    // 1. Validate input with Zod
    const validated = createTableSchema.parse(data);

    console.log(validated);

    // 2. Check for existing active table with same number in the branch
    const exists = await TableTable.exists({
      number: validated.tableNumber,
      isActive: true,
    });

    if (exists) {
      throw new AppError("Table number already exists in this branch", 409);
    }

    // 3. Create and save new table
    const table = new TableTable({
      ...validated,
      createdBy: new Types.ObjectId(createdBy),
      isActive: true,
    });
    console.log(table);

    await table.save();
    return table; // or just return table;
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      throw new AppError(`Validation failed: ${error.message}`, 400);
    }

    // Re-throw known AppErrors (like duplicate table number)
    if (error instanceof AppError) {
      throw error;
    }

    // Handle Mongoose validation or duplicate key errors (e.g., unique index on number + branchId)
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new AppError("Table number already exists in this branch", 409);
    }

    // Any other unexpected error
    throw new AppError("Failed to create table", 500);
  }
};

export const updateTableService = async (
  id: string,
  data: unknown
): Promise<ITable> => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid table ID", 400);
    }

    const validated = updateTableSchema.parse(data);

    const table = await TableTable.findByIdAndUpdate(
      id,
      { $set: validated },
      { new: true, runValidators: true }
    );

    if (!table) {
      throw new AppError("Table not found", 404);
    }

    return table;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to update table", 500);
  }
};

export const getAllTablesService = async (): Promise<ITable[]> => {
  try {
    const tables = await TableTable.find()
      .sort({ tableNumber: 1 })
      .lean();

    return tables as ITable[];
  } catch (error) {
    throw new AppError("Failed to fetch tables", 500);
  }
};
