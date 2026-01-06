import { Router } from "express";
import { loginController, logoutController } from "./auth.controller";
import { validateReqBody } from "middlewares/validate.middleware";
import { loginSchema } from "./auth.validation";
const router = Router();

// router.post("/register", c.registerController);
router.post("/login", validateReqBody(loginSchema), loginController);
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
