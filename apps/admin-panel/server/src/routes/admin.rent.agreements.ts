import { Router } from 'express';
import { 
  getAllRentAgreements,
  getRentAgreementById,
  updatePaymentStatus,
  updateDocumentStatus,
  deleteRentAgreement,
  getRentAgreementStats
} from '../controllers/admin.rent.agreement.controllers';
import { authenticateAdmin, checkPermission } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Get all rent agreements
router.get('/', getAllRentAgreements);

// Get rent agreement statistics
router.get('/stats', getRentAgreementStats);

// Get rent agreement by ID
router.get('/:id', getRentAgreementById);

// Update payment status
router.patch('/:id/payment', checkPermission('canManagePayments'), updatePaymentStatus);

// Update document status
router.patch('/:id/document', updateDocumentStatus);

// Delete rent agreement
router.delete('/:id', checkPermission('canDeleteAgreements'), deleteRentAgreement);

export default router;
