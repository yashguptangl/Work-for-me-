import express from "express";
import {
  initiateVerificationController,
  completePaymentController,
  captureLocationController,
  getVerificationStatusController,
  getOwnerVerificationRequestsController,
} from "../controllers/owner.verification.controllers";
import { ownerAuth } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(ownerAuth);

// Initiate verification request
router.post("/initiate", initiateVerificationController);

// Complete payment
router.post("/payment/complete", completePaymentController);

// Capture location
router.post("/capture-location", captureLocationController);

// Get verification status for a property
router.get("/status/:propertyId", getVerificationStatusController);

// Get all verification requests for owner
router.get("/requests", getOwnerVerificationRequestsController);

export default router;
