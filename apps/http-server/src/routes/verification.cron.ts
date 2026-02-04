import express from "express";
import { expireVerifications, sendExpiryReminders, runVerificationMaintenance } from "../utils/verificationCron";

const router = express.Router();

// Endpoint to manually trigger verification expiry check
router.post("/expire-verifications", async (req, res) => {
  try {
    const result = await expireVerifications();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Endpoint to manually trigger expiry reminders
router.post("/send-expiry-reminders", async (req, res) => {
  try {
    const result = await sendExpiryReminders();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Endpoint to run full maintenance (both expiry and reminders)
router.post("/run-maintenance", async (req, res) => {
  try {
    const result = await runVerificationMaintenance();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
