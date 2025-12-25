import {
  PermissionValue,
  ROLE_PERMISSIONS,
  RoleValue,
} from "config/permissions";
import { CreatedUser, GetUsersOptions, ICreateUserInput, IUpdateUserInput } from "types/user.interface";
import { hashPassword } from "utils/hash";
import { ROLES } from "./../../config/permissions";
import { UserTable } from "./user.model";

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
    // Exclude sensitive admin email
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
    // Add more safe fields if needed
  }));
};
// Update user
export const updateUser = async (
  id: string,
  data: Partial<IUpdateUserInput>
): Promise<CreatedUser> => {
  try {
    // Handle password update
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // Handle role update → auto-assign permissions
    if (data.role) {
      const normalizedRole = data.role.trim().toLowerCase() as RoleValue;

      if (!Object.values(ROLES).includes(normalizedRole)) {
        throw new Error(`Invalid role: "${data.role}"`);
      }

      data.role = normalizedRole;
      data.permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    }

    // Update DB
    const updatedUser = await UserTable.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpiry -failedLoginAttempts -lockUntil");

    if (!updatedUser) {
      throw new Error("User not found");
    }

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
    if (error.code === 11000) throw new Error("Email already in use");
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Delete user
export const deleteUser = async (id: string) => {
  return UserTable.findByIdAndDelete(id);
};
