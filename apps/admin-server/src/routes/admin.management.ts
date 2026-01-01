import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllOwners,
  getAllProperties,
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  deleteUser,
  deleteOwner,
  deleteProperty,
} from "../controllers/admin.management.controllers";
import { authenticateAdmin } from "../middleware/auth";

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get("/stats", getDashboardStats);

// Users Management
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);

// Owners Management
router.get("/owners", getAllOwners);
router.delete("/owners/:ownerId", deleteOwner);

// Properties Management
router.get("/properties", getAllProperties);
router.delete("/properties/:propertyId", deleteProperty);

// Verifications
router.get("/verifications", getVerificationRequests);
router.post("/verifications/:requestId/approve", approveVerification);
router.post("/verifications/:requestId/reject", rejectVerification);

export default router;