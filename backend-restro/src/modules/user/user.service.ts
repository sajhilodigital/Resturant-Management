import {
  PERMISSIONS,
  PermissionValue,
  ROLE_PERMISSIONS,
  RoleValue,
} from "config/permissions";
import {
  CreatedUser,
  CurrentUser,
  GetUsersOptions,
  ICreateUserInput,
  IUpdateUserInput,
  IUser,
  PermissionOperationResult,
} from "types/user.interface";
import { hashPassword } from "utils/hash";
import { ROLES } from "../../config/permissions";
import { UserTable } from "./user.model";
import { AppError } from "utils/appError";
import { Types } from "mongoose";

// Create user function with proper Promise return type
export const createUser = async (
  input: ICreateUserInput
): Promise<CreatedUser> => {
  try {
    // 1. Normalize role (safe, since RoleValue is string)
    const normalizedRole = input.role.trim().toLowerCase() as RoleValue;

    // 2. Validate role exists
    if (!Object.values(ROLES).includes(normalizedRole)) {
      throw new Error(
        `Invalid role: "${input.role}". Allowed: ${Object.values(ROLES).join(
          ", "
        )}`
      );
    }

    // 3. Get permissions for this role (type-safe indexing)
    const permissions: PermissionValue[] =
      ROLE_PERMISSIONS[normalizedRole] || []; // No need for 'as keyof' - keys match RoleValue

    // 4. Prepare final data
    const userData = {
      ...input,
      role: normalizedRole,
      permissions,
      isVerified: false,
      isActive: true,
      password: await hashPassword(input.password),
    };

    // 5. Create and save
    const user = await new UserTable(userData).save();

    // 6. Return safe projection (Promise<CreatedUser>)
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions as PermissionValue[], // safe cast
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Email already exists");
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const getUsers = async (
  options: GetUsersOptions = {}
): Promise<any[]> => {
  const { excludeUserId } = options;

  const query: any = {
    // Exclude super admin email
    email: { $ne: "sajhilodigital@gmail.com" },
  };

  // If logged-in user ID is provided, exclude them too
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const users = await UserTable.find(query).select(
    "-password -otp -otpExpiry -failedLoginAttempts -lockUntil -resetPasswordToken -resetPasswordExpiry"
  );

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    isVerified: user.isVerified,
    isActive: user.isActive,
  }));
};
// Update user
export const updateUser = async (
  id: string,
  data: Partial<IUpdateUserInput>
): Promise<CreatedUser> => {
  try {
    const updatePayload: Partial<IUpdateUserInput> = {};

    // 1️⃣ Password update
    if (typeof data.password === "string" && data.password.trim()) {
      updatePayload.password = await hashPassword(data.password);
    }

    // 2️⃣ Role update → normalize + assign permissions
    if (typeof data.role === "string") {
      const normalizedRole = data.role.trim().toLowerCase() as RoleValue;

      // CHECK ROLE VALUE (correct)
      if (!Object.values(ROLES).includes(normalizedRole)) {
        throw new Error(`Invalid role: "${data.role}"`);
      }

      updatePayload.role = normalizedRole;
      updatePayload.permissions = ROLE_PERMISSIONS[normalizedRole];
    }

    // 3️⃣ Other updatable fields (explicit allow-list)
    if (typeof data.name === "string") updatePayload.name = data.name;
    if (typeof data.email === "string") updatePayload.email = data.email;
    if (typeof data.isActive === "boolean")
      updatePayload.isActive = data.isActive;

    // 4️⃣ Update DB
    const updatedUser = await UserTable.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -otp -otpExpiry -failedLoginAttempts -lockUntil");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // 5️⃣ Return safe response
    return {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: updatedUser.permissions as PermissionValue[],
      isVerified: updatedUser.isVerified,
      isActive: updatedUser.isActive,
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Email already in use");
    }
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (id: string, currentUserId: string) => {
  // Find user to delete
  const user = await UserTable.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent deletion of admin users
  if (user.role === ROLES.ADMIN) {
    throw new Error("Admin users cannot be deleted");
  }

  // Prevent self-deletion
  if (user._id.toString() === currentUserId) {
    throw new Error("Logged-in user cannot delete themselves");
  }

  // Delete user
  await UserTable.findByIdAndDelete(id);
  return true;
};

// ────────────────────────────────────────────────
// Add single permission to user
// ────────────────────────────────────────────────

export const addUserPermissionService = async (
  userId: string,
  permission: string,
  currentUser: CurrentUser
): Promise<PermissionOperationResult> => {
  // Early validation
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID format", 400);
  }

  if (!Object.values(PERMISSIONS).includes(permission as any)) {
    throw new AppError(`Invalid permission value: "${permission}"`, 400);
  }

  try {
    // Atomic update - best practice (prevents race conditions)
    const updatedUser = await UserTable.findOneAndUpdate(
      {
        _id: userId,
        permissions: { $ne: permission }, // only update if not already present
      },
      {
        $addToSet: { permissions: permission },
      },
      {
        new: true, // return updated document
        select: "permissions role email name", // only needed fields
        lean: true, // plain JS object, better performance
      }
    );

    if (!updatedUser) {
      // Two possible cases: user not found OR permission already existed
      const userExists = await UserTable.exists({ _id: userId });

      if (!userExists) {
        throw new AppError("User not found", 404);
      }

      // Permission already existed → fetch current state
      const existingUser = await UserTable.findById(userId)
        .select("permissions role email name")
        .lean();

      return {
        user: existingUser!,
        message: `Permission "${permission}" already exists`,
        action: "no-op",
      };
    }
    // Idempotent operation
    if (!updatedUser.permissions.includes(permission)) {
      return {
        user: updatedUser,
        message: `Permission '${permission}' not found`,
        action: "no-op",
      };
    }

    if (updatedUser.role === ROLES.ADMIN && currentUser.role !== ROLES.ADMIN) {
      throw new AppError("Cannot modify permissions of admin accounts", 403);
    }

    return {
      user: updatedUser,
      message: `Permission "${permission}" successfully added`,
      action: "added",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // In real project → log the original error here (winston/sentry/...)
    console.error("addUserPermissionService unexpected error:", error);

    throw new AppError(
      `Failed to add permission: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
};
// ────────────────────────────────────────────────
// Remove single permission from user
// ────────────────────────────────────────────────
export const removeUserPermissionService = async (
  userId: string,
  permission: string,
  currentUser: { role: string; id: string }
) => {
  try {
    const targetUser = await UserTable.findById(userId).select("+permissions");
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }
    if (targetUser.role === ROLES.ADMIN && currentUser.role !== ROLES.ADMIN) {
      throw new AppError("Cannot modify permissions of admin accounts", 403);
    }

    // Idempotent operation
    if (!targetUser.permissions.includes(permission)) {
      return {
        user: targetUser.toObject(),
        message: `Permission '${permission}' not found`,
        action: "no-op",
      };
    }

    // Remove & save
    targetUser.permissions = targetUser.permissions.filter(
      (p) => p !== permission
    );
    targetUser.markModified("permissions");

    await targetUser.save({ validateModifiedOnly: true });

    return {
      user: targetUser.toObject(),
      message: `Permission '${permission}' successfully removed`,
      action: "removed",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      `Failed to remove permission: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
};
