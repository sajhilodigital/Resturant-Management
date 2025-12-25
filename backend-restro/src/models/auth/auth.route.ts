import { Router } from "express";
import { validate } from "middlewares/validate.middleware";
import { loginSchema } from "models/user/user.validation";
import { loginController, logoutController } from "./auth.controller";
const router = Router();

// router.post("/register", c.registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/logout", logoutController);

// router.post("/verify-otp", validate(otpSchema), verifyOTPController);

// router.post("/forget-password", forgetPasswordController);
// router.post(
//   "/reset-password",
//   validate(resetPasswordSchema),
//   resetPasswordController
// );
// router.post("/resend-otp", resendOTPController);

export { router as authRoutes };
