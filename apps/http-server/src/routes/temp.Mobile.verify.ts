import { Router } from "express";
const tempVerification = Router();
import {
    preverifySendOtp,
    preverifyVerifyOtp,
    preverifyResendOtp,
    generateOwnerListingOTP,
    verifyOwnerListingOTP
} from "../controllers/temp.Mobile.verify.controllers"
import { authenticateJWT } from "../middleware/auth";

tempVerification.post("/preverify/send-otp" , preverifySendOtp);
tempVerification.post("/preverify/verify-otp" , preverifyVerifyOtp);
tempVerification.post("/preverify/resend-otp" , preverifyResendOtp);

// Owner listing verification routes (protected)
tempVerification.post("/owner-listing/send-otp", authenticateJWT, generateOwnerListingOTP);
tempVerification.post("/owner-listing/verify-otp", authenticateJWT, verifyOwnerListingOTP);

export default tempVerification;