import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import * as service from "./auth.service.js";
import { ENV } from "config/env.js";

// export const registerController = [
//   validate(registerSchema),
//   asyncHandler(async (req: Request, res: Response) => {
//     const user = await service.register(req.body);
//     successResponse(res, user, "Registered, OTP sent");
//   }),
// ];

export const verifyOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.verifyOTP(req.body.email, req.body.otp);
    successResponse(res, null, "OTP verified");
  }
);

//User Login
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { token, user } = await service.loginUser({ email, password });

    // Set secure cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JS access (XSS protection)
      secure: ENV.NODE_ENV === "production", // false in local dev (HTTP)
      sameSite: "lax", // CSRF protection (or 'strict')
      maxAge: 24 * 60 * 60 * 1000, // 1 day - match your JWT expiry
      path: "/", // Site-wide
    });
    successResponse(res, { token, user }, "Login successful");
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    // Clear cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    successResponse(res, null, "Logged out successfully");
  }
);

export const forgetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.forgetPassword(req.body.email);
    successResponse(res, null, "OTP sent for reset");
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.resetPassword(
      req.body.email,
      req.body.otp,
      req.body.password
    );
    successResponse(res, null, "Password reset");
  }
);

export const resendOTPController = asyncHandler(
  async (req: Request, res: Response) => {
    await service.resendOTP(req.body.email);
    successResponse(res, null, "OTP resent");
  }
);
