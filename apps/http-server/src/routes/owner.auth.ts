import express from "express";
const ownerRouter = express.Router();
import {
    ownerAuthController,
    ownerLoginController,
    ownerLogoutController,
    ownerResendOTPController,
    ownerVerifyOtpController,
    ownerResetPasswordController ,
    ownerForgotPasswordController,
    getOwnerProfile,
    updateOwnerProfile
} from "../controllers/owner.auth.controllers";
import { ownerAuth as ownerAccess } from "../middleware/auth";

ownerRouter.post("/signup", ownerAuthController)
ownerRouter.post("/login", ownerLoginController)
ownerRouter.post("/logout", ownerLogoutController)
ownerRouter.post("/resend-otp", ownerResendOTPController)
ownerRouter.post("/verify-otp", ownerVerifyOtpController)
ownerRouter.post("/reset-password", ownerResetPasswordController)
ownerRouter.post("/forgot-password", ownerForgotPasswordController)

ownerRouter.get("/profile", ownerAccess, getOwnerProfile);
ownerRouter.put("/profile", ownerAccess, updateOwnerProfile);

export default ownerRouter;