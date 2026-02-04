import { Router } from 'express';
import * as verificationsController from '../controllers/admin.verifications.controllers';
import { authenticateAdmin, checkPermission, requireMainAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateAdmin);

router.get('/', checkPermission('canVerifyProperties'), verificationsController.getAllVerificationRequests);
router.get('/stats', checkPermission('canVerifyProperties'), verificationsController.getVerificationStats);
router.get('/:id', checkPermission('canVerifyProperties'), verificationsController.getVerificationRequestById);
router.post('/:id/assign', requireMainAdmin, verificationsController.assignVerificationRequest);
router.post('/:id/review', checkPermission('canVerifyProperties'), verificationsController.reviewVerificationRequest);

export default router;
