import { generateOTP, sendOTP } from "../../utils/otp.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";
import { ENV } from "../../config/env.js";
import { UserTable } from "models/user/user.model.js";
import { loginSchema } from "models/user/user.validation.js";
import { ILoginUserInput } from "types/user.interface.js";

// export const register = async (data: any) => {
//   if (await UserTable.findOne({ email: data.email })) throw new Error("UserTable exists");

//   const otp = generateOTP();
//   sendOTP(data.email, otp);

//   const user = new UserTable({
//     ...data,
//     password: await hashPassword(data.password),
//     otp,
//     otpExpiry: new Date(Date.now() + ENV.OTP_EXPIRY * 1000),
//     isVerified: false,
//   });
//   await user.save();
//   return user;
// };

export const verifyOTP = async (email: string, otp: string) => {
  const user = await UserTable.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < new Date())
    throw new Error("Invalid OTP");
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
};

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
  };
}

// Login service function
export const loginUser = async (
  input: ILoginUserInput
): Promise<LoginResponse> => {
  // 1. Validate input
  const { email, password } = loginSchema.parse(input);

  // 2. Find user + include password (critical!)
  const user = await UserTable.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 3. Account status checks
  if (!user.isActive) {
    throw new Error("Account is deactivated. Contact support.");
  }

  if (!user.isVerified) {
    throw new Error("Account not verified. Please check your email.");
  }

  // 4. Optional: Account lockout check (prevents brute-force)
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error(
      "Account is temporarily locked due to too many failed attempts. Try again later."
    );
  }

  // 5. Compare password
  const isMatch = await comparePassword(password, user.password!);
  if (!isMatch) {
    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // Optional: Lock account after 5 failed attempts (for 15 minutes)
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
    }

    await user.save();
    throw new Error("Invalid email or password");
  }

  // 6. Reset failed attempts & lock on success
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  // 7. Generate JWT
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // 8. Safe user data (never expose password or sensitive fields)
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };

  return {
    token,
    user: safeUser,
  };
};

export const forgetPassword = async (email: string) => {
  const user = await UserTable.findOne({ email });
  if (!user) throw new Error("UserTable not found");
  const otp = generateOTP();
  sendOTP(email, otp);
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + ENV.OTP_EXPIRY * 1000);
  await user.save();
};

export const resetPassword = async (
  email: string,
  otp: string,
  password: string
) => {
  const user = await UserTable.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < new Date())
    throw new Error("Invalid OTP");
  user.password = await hashPassword(password);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
};

export const resendOTP = async (email: string) => {
  const user = await UserTable.findOne({ email });
  if (!user) throw new Error("UserTable not found");
  const otp = generateOTP();
  sendOTP(email, otp);
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + ENV.OTP_EXPIRY * 1000);
  await user.save();
};
