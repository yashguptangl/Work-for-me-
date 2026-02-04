import { Router } from 'express';
import * as dashboardController from '../controllers/admin.dashboard.controllers';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/recent-users', dashboardController.getRecentUsers);
router.get('/recent-properties', dashboardController.getRecentProperties);

export default router;
