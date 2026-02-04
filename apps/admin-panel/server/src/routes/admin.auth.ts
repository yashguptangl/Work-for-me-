import { Router } from 'express';
import * as authController from '../controllers/admin.auth.controllers';
import { authenticateAdmin, requireMainAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateAdmin, authController.getProfile);
router.post('/change-password', authenticateAdmin, authController.changePassword);

// Main admin only
router.post('/create-admin', authenticateAdmin, requireMainAdmin, authController.createAdmin);

export default router;
