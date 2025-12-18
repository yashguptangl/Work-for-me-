import express from "express";
import { 
  userAuthController, 
  userLoginController, 
  userLogoutController, 
  userResendOTPController,
  userVerifyOtpController,
  userResetPasswordController,
  userForgotPasswordController
} from "../controllers/user.auth.controllers";

const userAuth = express.Router();
// Main authentication routes
userAuth.post("/signup", userAuthController);    
userAuth.post("/login", userLoginController);
userAuth.post("/logout", userLogoutController);
userAuth.post("/forgot-password", userForgotPasswordController);
userAuth.post("/resend-otp", userResendOTPController);

// Additional helper routes
userAuth.post("/verify-otp", userVerifyOtpController);
userAuth.post("/reset-password", userResetPasswordController);

export default userAuth;