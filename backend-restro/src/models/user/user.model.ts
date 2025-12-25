import { Schema, model } from "mongoose";
import { PERMISSIONS, PermissionValue, ROLES } from "../../config/permissions.js";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Please provide a valid email address",
    ],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // Never return password in queries by default
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
    sparse: true, // Allows null/undefined while keeping unique index if needed
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    lowercase: true,
  },

  permissions: {
    type: [String],
    default: [],

    // Normalization on set
    set: (val: unknown) => {
      if (!Array.isArray(val)) return [];
      return [
        ...new Set(
          val
            .filter(
              (v): v is string => typeof v === "string" && v.trim().length > 0
            )
            .map((v) => v.trim().toLowerCase())
        ),
      ];
    },

    // Type-safe validator
    validate: {
      validator: function (this: any, val: unknown): boolean {
        // Must be array
        if (!Array.isArray(val)) return false;

        // Get known permission values as readonly array (literal types)
        const knownPermissions = Object.values(
          PERMISSIONS
        ) as readonly PermissionValue[];

        // Every element must be a non-empty string AND match a known permission
        return val.every(
          (p): p is PermissionValue =>
            typeof p === "string" &&
            p.trim().length > 0 &&
            knownPermissions.includes(p.trim().toLowerCase() as PermissionValue)
        );
      },

      // Better error message with allowed values
      message: function (props: any) {
        const allowed = Object.values(PERMISSIONS).join(", ");
        return `Invalid permission value(s): ${props.value}. Allowed: ${allowed}`;
      },
    },

    index: true,
  },
  
  isVerified: { type: Boolean, default: false },
  // Security & account status
  isActive: { type: Boolean, default: true, index: true },

  // Login security
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }, // Account lock time after too many failed attempts

  // OTP & Password Reset
  otp: { type: String },
  otpExpiry: { type: Date },

  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
});

// ────────────────────────────────────────────────
// Indexes (for performance in large scale)
// ────────────────────────────────────────────────
userSchema.index({ email: 1 }); // Fast lookup by email
userSchema.index({ restaurantId: 1, role: 1 }); // Multi-tenant performance
userSchema.index({ isActive: 1 });

export const UserTable = model("User", userSchema);
